const fs = require('fs');
const zstd = require('node-zstandard');
const exec = require('child_process').exec;

// List of all the database files you want to download
const files = ["lichess_db_standard_rated_2013-01.pgn.zst", /*...*/];

const decompressAndAnalyze = async (file, start = 0) => {
    let chunk_counter = 0; // Initialize the chunk counter

    const path = `/Users/bennyrubanov/chessanalysis/data/${file.replace('.zst', '')}`;

    // Check if file already exists
    if (fs.existsSync(path)) {
        const stats = fs.statSync(path);
        start = stats.size;
    }

    const decompressedStream = fs.createWriteStream(path, { flags: 'a' });

    const decompressionStream = await zstd.decompressionStreamFromFile(`/Users/bennyrubanov/chessanalysis/data/${file}`);

    let chunk;
    while (null !== (chunk = await decompressionStream.read())) {
        decompressedStream.write(chunk);
        let lastChunkLength = chunk.length;

        const duration = Date.now() - startTime;
        const durationFormatted = formatDuration(duration);
        start += lastChunkLength;

        console.log(`Decompressed data for chunk starting from byte ${start - lastChunkLength} and ending on byte ${start} of ${file} in ${durationFormatted}`);

        // Run the analysis script
        console.log(`Running analysis script on chunk from byte ${start - lastChunkLength} and ending on byte ${start} of ${file}...`);

        await new Promise((resolve, reject) => {
            exec(`node /Users/bennyrubanov/chessanalysis/dist/src/index.js ${path}`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    reject(new Error(stderr));
                    return;
                }
                console.log(`stdout: ${stdout}`);
                resolve(stdout);
            });
        });

        // Increment the chunk counter
        chunk_counter++;

        console.log(`Analysis script run on chunk ${chunk_counter} of ${file}.`);

        console.log(`Chunk cycle for chunk ${chunk_counter} finished`);
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