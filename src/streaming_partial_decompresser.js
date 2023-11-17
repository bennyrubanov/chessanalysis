const fs = require('fs');
const zstd = require('node-zstandard');
const exec = require('child_process').exec;
const { spawn } = require('child_process');

// List of all the database files you want to download
const files = ["lichess_db_standard_rated_2013-01.pgn.zst", /*...*/];

// 30 games = 10*1024 bytes, 1 game = 350 bytes, 1000 games = 330KB, 100K games = 33MB
// 10MB yields around 30k games, 5GB = 15 million games?

const decompressAndAnalyze = async (file, start = 0) => {
    let chunk_counter = 0; // Initialize the chunk counter

    const path = `/Users/bennyrubanov/chessanalysis/data/${file.replace('.zst', '')}`;

    // Check if file already exists
    if (fs.existsSync(path)) {
        const stats = fs.statSync(path);
        start = stats.size;
    }

    const decompressedStream = fs.createWriteStream(path, { flags: 'a' });

    while (true) {
        try {
            await new Promise((resolve, reject) => {
                console.log(`Starting decompression of chunk number ${chunk_counter}.`);

                let startTime = Date.now();

                zstd.decompressionStreamFromFile(`/Users/bennyrubanov/chessanalysis/data/${file}`, (err, result) => {
                    if (err) return reject(err);

                    let lastChunkLength = 0;

                    result.on('error', (err) => {
                        return reject(err);
                    });
                    result.on('data', (data) => {
                        decompressedStream.write(data);
                        lastChunkLength = data.length;

                        const duration = Date.now() - startTime;
                        const durationFormatted = formatDuration(duration);
                        start += lastChunkLength;

                        console.log(`Decompressed data for chunk starting from byte ${start - lastChunkLength} and ending on byte ${start} of ${file} in ${durationFormatted}`);

                        // Run the analysis script
                        console.log(`Running analysis script on chunk from byte ${start - lastChunkLength} and ending on byte ${start} of ${file}...`);

                        const child = spawn('ts-node', ['/Users/bennyrubanov/chessanalysis/src/index.ts', path]);
                        
                        child.stdout.on('data', (data) => {
                          console.log(`stdout: ${data}`);
                        });
                        
                        child.stderr.on('data', (data) => {
                          console.log(`stderr: ${data}`);
                        });
                        
                        child.on('error', (error) => {
                          console.log(`error: ${error.message}`);
                        });
                        
                        child.on('close', (code) => {
                          console.log(`child process exited with code ${code}`);
                        });

                        // Increment the chunk counter
                        chunk_counter++;

                        console.log(`Analysis script run on chunk ${chunk_counter} of ${file}.`);

                        console.log(`Chunk cycle for chunk ${chunk_counter} finished`);
                    });
                    result.on('end', () => {
                        resolve();
                    });
                });
            });

        } catch (error) {
            console.error(`Error decompressing data: ${error.message}`);
            break;
        }
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