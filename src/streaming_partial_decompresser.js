const fs = require('fs');
const zstd = require('node-zstandard');
const exec = require('child_process').exec;
const { spawn } = require('child_process');

// List of all the database files you want to download
const files = ["lichess_db_standard_rated_2013-01.pgn.zst", /*...*/];

// 30 games = 10*1024 bytes, 1 game = 350 bytes, 1000 games = 330KB, 100K games = 33MB
// 10MB yields around 30k games, 5GB = 15 million games?
const SIZE_LIMIT = 10 * 1024 * 1024

// function to check file size
const getFileSize = (filePath) => {
    if (!fs.existsSync(filePath)) {
        return 0;
    }
    const stats = fs.statSync(filePath);
    return stats.size;
};

const runAnalysis = (filePath) => {
    return new Promise((resolve, reject) => {
        // Run the analysis script
        console.log(`Running analysis script on ${filePath}...`);

        const child = spawn('ts-node', ['/Users/bennyrubanov/chessanalysis/src/index.ts', filePath]);

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        child.on('error', (error) => {
            console.log(`error: ${error.message}`);
            reject(error);
        });

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            resolve();
        });
    });
};

const decompressAndAnalyze = async (file, start = 0) => {
    let chunk_counter = 0; // Initialize the chunk counter
    let file_counter = 0; // Initialize the file counter

    const base_path = `/Users/bennyrubanov/chessanalysis/data/${file.replace('.zst', '')}`;

    // Create a new file path
    let path = `${base_path}_${file_counter}`;

    // Create a new writable stream
    let decompressedStream = fs.createWriteStream(path, { flags: 'a' });

    // Check if file already exists
    if (fs.existsSync(path)) {
        const stats = fs.statSync(path);
        start = stats.size;
    }

    try {
        await new Promise((resolve, reject) => {
            console.log(`Starting decompression of chunk number ${chunk_counter}.`);

            let startTime = Date.now();

            zstd.decompressionStreamFromFile(`/Users/bennyrubanov/chessanalysis/data/${file}`, (err, result) => {
                if (err) return reject(err);

                let lastChunkLength = 0;
                let fileLength = 0;

                result.on('error', (err) => {
                    return reject(err);
                });

                result.on('data', async (data) => {
                    decompressedStream.write(data);
                    lastChunkLength = data.length;

                    const duration = Date.now() - startTime;
                    const durationFormatted = formatDuration(duration);
                    fileLength += data.length

                    // Increment the chunk counter
                    chunk_counter++;

                    if (chunk_counter % 200 === 0) {
                        console.log(`${chunk_counter} chunks decompressed of total size ${fileLength / 1024 / 1024} MB`)
                    }

                    // Check if the file size exceeds the limit
                    if (getFileSize(path) >= SIZE_LIMIT) {
                        // Save the old path for analysis
                        let oldPath = path;
                    
                        // Increment the file counter
                        file_counter++;
                    
                        // Create a new file path
                        path = `${base_path}_${file_counter}`;
                    
                        console.log(`Creating file number ${file_counter}`);
                    
                        // Switch to a new file
                        decompressedStream = fs.createWriteStream(path, { flags: 'a' });
                                        
                        // Start the analysis on the old file, then delete the old file when finished
                        if (fs.existsSync(oldPath)) {
                            runAnalysis(oldPath).then(() => {
                                if (fs.existsSync(oldPath)) {
                                    fs.unlinkSync(oldPath);
                                }
                            }).catch(console.error);
                        }
                    
                        console.log(`Total number of chunks decompressed so far: ${chunk_counter}`);
                        console.log(`Finished decompression of data starting from byte ${start} and ending on byte ${start + fileLength} of ${file} in ${durationFormatted}`);
                    
                        start += fileLength;
                        fileLength = 0;
                    }
                });

                result.on('end', () => {
                    // When all data is decompressed, run the analysis on the last file
                    runAnalysis(path);
                    resolve();               
                });
            });
        });

    } catch (error) {
        console.error(`Error decompressing data: ${error.message}`);
    }
};

// Function to process all files
const processFiles = async () => {
    for (const file of files) {
        await decompressAndAnalyze(file);
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