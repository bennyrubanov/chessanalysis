const https = require('https');
const fs = require('fs');
const zstd = require('node-zstandard');
const exec = require('child_process').exec;
const axios = require('axios');
const ProgressBar = require('progress');

// List of all the database files you want to download
const files = ["lichess_db_standard_rated_2023-08.pgn.zst", "lichess_db_standard_rated_2023-09.pgn.zst" /*...*/];

// Size of each decompressing chunk in bytes (10MB = 10 * 1024 * 1024 bytes which yields around 30k games)
const chunk_size = 10 * 1024 * 1024;

// function to download the file, automatically retrying when the download stops, 
// and retrying at the last byte that was left off
const downloadFile = async (file, maxRetries = 100) => {
    const url = `https://database.lichess.org/standard/${file}`;
    const path = `/Users/bennyrubanov/chessanalysis/data/${file}`;

    console.log(`Starting download of ${file}`);

    // Check if file already exists
    let startByte = 0;
    if (fs.existsSync(path)) {
        const stats = fs.statSync(path);
        startByte = stats.size;
    }

    let retries = 0;
    while (retries < maxRetries) {
        try {
            await new Promise(async (resolve, reject) => {

                let headResponse = await axios({
                    url,
                    method: 'HEAD'
                });

                const fileSize = headResponse.headers['content-length'];

                console.log(`startByte: ${startByte}, fileSize: ${fileSize}`);

                if (startByte >= fileSize) {
                    console.log('File already fully downloaded');
                    return;
                }
                
                const response = await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream',
                    headers: {
                        'Range': `bytes=${startByte}-`
                    },
                    timeout: 5000 // Timeout of 5 seconds
                });


                const acceptRanges = response.headers['accept-ranges'];
                if (acceptRanges !== 'bytes') {
                    console.log('Server does not support range requests');
                    // Handle the lack of support for range requests...
                }
                
                const contentRange = response.headers['content-range'];
                if (contentRange) {
                    const range = contentRange.split('/')[0].split('-');
                    const rangeStart = parseInt(range[0]);
                    const rangeEnd = parseInt(range[1]);
                
                    if (rangeStart !== startByte) {
                        console.log(`Server returned unexpected range: ${rangeStart}-${rangeEnd}`);
                        // Handle the unexpected range...
                    }
                }

                const totalLength = response.headers['content-length'];
                console.log('totalLength', totalLength);
                console.log('contentRange', contentRange);

                const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
                    width: 40,
                    complete: '=',
                    incomplete: ' ',
                    renderThrottle: 1,
                    total: parseInt(totalLength)
                });

                let startTime = Date.now();

                let downloadAborted = false;
                let timeoutHandler;
                response.data.on('data', (chunk) => {
                    progressBar.tick(chunk.length);
                    // Remove the previous timeout listener
                    if (timeoutHandler) {
                        response.data.removeListener('timeout', timeoutHandler);
                    }
                    // Reset the timeout every time data is received
                    timeoutHandler = () => {
                        if (!downloadAborted) {
                            downloadAborted = true;
                            console.log('Download stalled, aborting...');
                            response.data.destroy(new Error('Download stalled'));
                        }
                    };
                    response.data.setTimeout(5000, timeoutHandler);
                });

                response.data.on('error', (error) => {
                    console.error(`Error in download stream: ${error.message}`);
                    reject(error);
                });

                const writer = fs.createWriteStream(path, { flags: 'a' });
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', () => {
                        const duration = Date.now() - startTime;
                        const durationFormatted = formatDuration(duration);
                        console.log(`Download of ${file} completed in ${durationFormatted}`);
                        resolve();
                    });
                    writer.on('error', reject);
                });
            });

            // If the download is successful, break the loop
            break;
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.message === 'Download stalled') {
                console.log(`Timeout occurred, retrying download...`);
            } else {
                console.error(`Error downloading data: ${error.message}`);
            }
            retries++;
            console.log(`Retry attempt ${retries}...`);
        }
    }

    if (retries === maxRetries) {
        console.error(`Failed to download file after ${maxRetries} attempts.`);
        throw new Error('Download failed');
    }
};


const decompressChunkAndAnalyze = async (file, start = 0) => {
    let chunk_counter = 0; // Initialize the chunk counter

    const path = `/Users/bennyrubanov/chessanalysis/data/${file.replace('.zst', '')}`;

    // Check if file already exists
    if (fs.existsSync(path)) {
        const stats = fs.statSync(path);
        start = stats.size;
    }

    const decompressedStream = fs.createWriteStream(path, { flags: 'a' });

    let end = start + chunk_size;

    while (true) {
        try {
            await new Promise((resolve, reject) => {
                console.log(`Decompressing ${file} from byte ${start} to ${end}`);

                let startTime = Date.now();

                zstd.decompressionStreamFromFile(`/Users/bennyrubanov/chessanalysis/data/${file}`, (err, result) => {
                    if (err) return reject(err);

                    result.on('error', (err) => {
                        return reject(err);
                    });
                    result.on('data', (data) => {
                        decompressedStream.write(data);
                        start += data.length;
                    });
                    result.on('end', () => {
                        const duration = Date.now() - startTime;
                        const durationFormatted = formatDuration(duration);
                        console.log(`Decompressed data for chunk starting from byte ${start} and ending on byte ${end} of ${file} in ${durationFormatted}`);

                        // Run the analysis script
                        console.log(`Running analysis script on chunk from ${start} to ${end} of ${file}...`);

                        exec('node /Users/bennyrubanov/chessanalysis/dist/src/index.js', (error, stdout, stderr) => {
                            if (error) {
                                console.log(`error: ${error.message}`);
                                return;
                            }
                            if (stderr) {
                                console.log(`stderr: ${stderr}`);
                                return;
                            }
                            console.log(`stdout: ${stdout}`);
                        });

                        console.log(`Analysis script run on chunk of ${file}.`);

                        // Increment the chunk counter
                        chunk_counter++;
                        console.log(`Chunk cycle for chunk ${chunk_counter} finished`);

                        resolve();
                    });
                });
            });

            // Update the byte range for the next chunk
            start = end;
            end = start + chunk_size;

        } catch (error) {
            console.error(`Error decompressing data: ${error.message}`);
            break;
        }
    }
};

// Function to process all files
const processFiles = async () => {
    for (const file of files) {
        await downloadFile(file);
        await decompressChunkAndAnalyze(file);
    }
};

// Start the process
processFiles();

const formatDuration = (duration) => {
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
};