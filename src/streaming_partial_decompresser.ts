//@ts-nocheck - this was written as a js file to start...
// TODO: This should use type checking
const fs = require('fs');
const zstd = require('node-zstandard');
const { spawn } = require('child_process');

// List of all the database files you want to analyze (these need to be downloaded and in data folder)
const files = ['lichess_db_standard_rated_2018-05.pgn.zst' /*...*/];

// 30 games = 10*1024 bytes, 1 game = 350 bytes, 1000 games = 330KB, 100K games = 33MB
// 10MB yields around 30k games, 5GB = around 15 million games
const SIZE_LIMIT = 30 * 1024 * 1024; // 30MB

// set the total size limit of the combined decompressed files (this is how much space you need to have available on your PC prior to running node src/streaming_partial_decompresser.js)
const decompressedSizeLimit = 500 * 1024 * 1024 * 1024; // 500 GB represented in bytes

// function to check file size
const getFileSize = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  const stats = fs.statSync(filePath);
  return stats.size;
};

/**
 * Runs the analysis script on a given file path.
 *
 * @param {string} filePath - The path of the file to run the analysis on.
 * @return {Promise} A promise that resolves when the analysis is complete.
 */
const runAnalysis = (filePath) => {
  return new Promise((resolve, reject) => {
    // Run the analysis script
    console.log(`Running analysis script on ${filePath}...`);

    const child = spawn('ts-node', [
      '/Users/bennyrubanov/Coding_Projects/chessanalysis/src/index_with_decompressor.ts',
      filePath,
    ]);

    // only log complete lines of output (no insertion of "stdout: " in the middle of a line)
    // do this by accumulating the data until a newline character, and then logging the accumulated data
    let accumulatedData = '';
    child.stdout.on('data', (data) => {
      accumulatedData += data;
      let newlineIndex;
      while ((newlineIndex = accumulatedData.indexOf('\n')) >= 0) {
        console.log(`stdout: ${accumulatedData.slice(0, newlineIndex)}`);
        accumulatedData = accumulatedData.slice(newlineIndex + 1);
      }
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

/**
 * Decompresses and analyzes a file.
 *
 * @param {string} file - The name of the file to decompress and analyze.
 * @param {number} [start=0] - The starting index for decompression.
 * @returns {Promise} A promise that resolves when the decompression and analysis is complete.
 */
const decompressAndAnalyze = async (file, start = 0) => {
  let stopDecompression = false;
  let these_chunks_counter = 0; // Initialize the chunk counter
  let file_counter = 1; // Initialize the file counter
  let total_chunk_counter = 0;

  const base_path = `/Users/bennyrubanov/Coding_Projects/chessanalysis/data/${file.replace(
    '.zst',
    ''
  )}`;

  // Create a new file path
  let newFilePath = `${base_path}_${file_counter}`;

  // Create a new writable strxeam
  console.log(`Creating file number ${file_counter}`);
  let decompressedStream = fs.createWriteStream(newFilePath, { flags: 'a' });

  // Check if file already exists
  if (fs.existsSync(newFilePath)) {
    const stats = fs.statSync(newFilePath);
    start = stats.size;
  }

  try {
    await new Promise((resolve, reject) => {
      console.log(
        `Starting decompression of chunk number ${total_chunk_counter}.`
      );

      let startTime = Date.now();

      // https://www.npmjs.com/package/node-zstandard#decompressionstreamfromfile-inputfile-callback
      zstd.decompressionStreamFromFile(
        `/Users/bennyrubanov/Coding_Projects/chessanalysis/data/${file}`,
        (err, result) => {
          if (err) return reject(err);

          let lastChunkLength = 0;
          let fileLength = 0;
          let all_files_lengths = 0;
          let batch_files_total_decompressed_size = 0;
          let analysisPromises = [];
          const MAX_CONCURRENT_ANALYSES = 13;
          let filesBeingAnalyzed = new Set();

          result.on('error', (err) => {
            return reject(err);
          });

          result.on('data', async (data) => {
            if (stopDecompression) {
              return; // Skip writing and updating counters if stopDecompression is true
            }

            decompressedStream.write(data);
            lastChunkLength = data.length;

            const duration = Date.now() - startTime;
            const durationFormatted = formatDuration(duration);
            fileLength += data.length;
            all_files_lengths += data.length;
            batch_files_total_decompressed_size += data.length;

            // Increment the chunk counter
            total_chunk_counter++;
            these_chunks_counter++;

            if (total_chunk_counter % 200 === 0) {
              console.log(
                `${these_chunks_counter} chunks decompressed with decompressed size ${
                  fileLength / 1024 / 1024
                } MB`
              );
            }

            // Check if the file size exceeds the limit
            if (getFileSize(newFilePath) >= SIZE_LIMIT) {
              console.log(
                `Finished decompression of data starting from byte ${start} and ending on byte ${
                  start + fileLength
                } of ${file} in ${durationFormatted}`
              );
              console.log(
                `Total number of chunks decompressed so far: ${total_chunk_counter}`
              );
              console.log(
                `Total decompressed size of files decompressed ${
                  all_files_lengths / 1024 / 1024
                } MB`
              );

              // Save the old path for analysis
              let oldPath = newFilePath;

              // Increment the file counter
              file_counter++;

              // Create a new file path
              newFilePath = `${base_path}_${file_counter}`;

              // Stop decompression if the size of the combined decompressed files exceeds the decompressed total combined files size limit
              if (
                batch_files_total_decompressed_size >= decompressedSizeLimit
              ) {
                console.log(
                  `Decompressed size limit met. Ending decompression and finalizing analyses...`
                );
                console.log(`Temp files being analyzed: ${filesBeingAnalyzed}`);
                stopDecompression = true; // Set the flag to true to stop decompression
                resolve(); // Resolve the promise to allow the 'end' event to handle the analysis
              }

              // Switch to a new file
              console.log(`Creating file number ${file_counter}`);
              decompressedStream = fs.createWriteStream(newFilePath, {
                flags: 'a',
              });

              // Add the old file to the set for analysis
              filesBeingAnalyzed.add(oldPath);

              start += fileLength;
              fileLength = 0;
              these_chunks_counter = 0;
            }
          });

          result.on('end', async () => {
            // When all data is decompressed, run the analysis on the last file
            let lastAnalysisPromise = runAnalysis(newFilePath)
              .then(() => {
                if (fs.existsSync(newFilePath)) {
                  fs.unlinkSync(newFilePath);
                  console.log(`File ${newFilePath} has been deleted.`);
                }
              })
              .catch(console.error);

            analysisPromises.push(lastAnalysisPromise);
            filesBeingAnalyzed.add(newFilePath);

            // When all analyses are done, delete the files
            Promise.allSettled(analysisPromises)
              .then(() => {
                console.log('All analyses completed');
                filesBeingAnalyzed.clear();
              })
              .catch(console.error);

            resolve();
          });
        }
      );
    });
  } catch (error) {
    console.error(`Error decompressing data: ${error.message}`);
  }
};

// Function to process all files
const processFiles = async () => {
  console.log(`Initiating decompression and analysis of ${files}...`);
  console.time('Final Total Compressed File Analysis Execution Time');
  for (const file of files) {
    await decompressAndAnalyze(file);
  }
  console.timeEnd('Final Total Compressed File Analysis Execution Time');
};

// Start the process
processFiles();

const formatDuration = (duration) => {
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  const milliseconds = duration % 1000;

  return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
};

module.exports = processFiles;
