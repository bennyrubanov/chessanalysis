import { randomUUID } from 'crypto';

// TODO: This should use type checking
const fs = require('fs');
const zstd = require('node-zstandard');
const { spawn } = require('child_process');

// List of all the database files you want to analyze (these need to be downloaded and in data folder)
const files = ['lichess_db_standard_rated_2018-05.pgn.zst' /*...*/];

// 30 games = 10*1024 bytes, 1 game = 350 bytes, 1000 games = 330KB, 100K games = 33MB
// 10MB yields around 30k games, 5GB = around 15 million games
// const SIZE_LIMIT = 30 * 1024 * 1024; // 30MB
const SIZE_LIMIT = 0.5 * 1024 * 1024; // 0.5MB, for testing

// set the total size limit of the combined decompressed files (this is how much space you need to have available on your PC prior to running node src/streaming_partial_decompresser.js)
const decompressedSizeLimit = 500 * 1024 * 1024 * 1024; // 500 GB represented in bytes

const getFileSize = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  const stats = fs.statSync(filePath);
  return stats.size;
};

/**
 * Runs the analysis script on a given file path.
 * @param {string} filePath - The path of the file to run the analysis on.
 * @return {Promise} A promise that resolves when the analysis is complete.
 */
async function runAnalysis(filePath) {
  return new Promise<void>((resolve, reject) => {
    // Run the analysis script
    console.log(`Running analysis script on ${filePath}...`);

    const child = spawn('ts-node', [
      //   '/Users/bennyrubanov/Coding_Projects/chessanalysis/src/index_with_decompressor.ts',
      `${__dirname}/../run_metrics_on_input.ts`,
      filePath,
    ]);

    // only log complete lines of output (no insertion of "stdout: " in the middle of a line)
    // do this by accumulating the data until a newline character, and then logging the accumulated data
    let accumulatedData = '';
    child.stdout.on('data', (data) => {
      accumulatedData += data;

      let newlineIndex;

      // this loop slices data while theere is a newline chanracter in the accumulated data
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
}

/**
 * Decompresses and analyzes a file.
 *
 * @param {string} file - The name of the file to decompress and analyze.
 * @param {number} [start=0] - The starting index for decompression.
 * @returns {Promise} A promise that resolves when the decompression and analysis is complete.
 */
const decompressAndAnalyze = async (file, start = 0) => {
  let these_chunks_counter = 0; // Initialize the chunk counter
  let file_counter = 1; // Initialize the file counter
  let total_chunk_counter = 0;
  const filesProduced = new Set();

  //   const base_path = `/Users/bennyrubanov/Coding_Projects/chessanalysis/data/${file.replace(
  const base_path = `${__dirname}/../data/${file.replace('.zst', '')}`;

  // Create a new file path
  const newFilePath = `${base_path}_${randomUUID()}`;
  filesProduced.add(newFilePath);

  // Create a new writable strxeam
  console.log(`Creating file #${file_counter} at ${newFilePath}`);
  let decompressedStream = fs.createWriteStream(newFilePath, { flags: 'a' });

  // Check if file already exists
  if (fs.existsSync(newFilePath)) {
    const stats = fs.statSync(newFilePath);
    start = stats.size;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      console.log(
        `Starting decompression of chunk number ${total_chunk_counter}.`
      );

      let startTime = Date.now();

      // https://www.npmjs.com/package/node-zstandard#decompressionstreamfromfile-inputfile-callback
      zstd.decompressionStreamFromFile(
        `${__dirname}/../data/${file}`,
        (err, result) => {
          if (err) return reject(err);

          let fileLength = 0;
          let batch_files_total_decompressed_size = 0;
          let analysisPromises = [];
          let filesBeingAnalyzed = new Set();

          result.on('error', (err) => {
            return reject(err);
          });

          result.on('data', async (data) => {
            decompressedStream.write(data);

            const duration = Date.now() - startTime;
            const durationFormatted = formatDuration(duration);
            fileLength += data.length;
            batch_files_total_decompressed_size += data.length;
            these_chunks_counter++;

            // Check if the file size exceeds the limit, if so we need to make a new file
            if (getFileSize(newFilePath) >= SIZE_LIMIT) {
              console.log(
                `Finished decompression of data starting from byte ${start} and ending on byte ${
                  start + fileLength
                } of ${file} in ${durationFormatted}`
              );
              console.log(
                `Total number of chunks decompressed so far: ${total_chunk_counter}`
              );
              // Increment the file counter
              file_counter++;

              // Create a new file path
              const newFilePath = `${base_path}_${randomUUID()}`;
              filesProduced.add(newFilePath);

              // Switch to a new file
              console.log(`Creating file number ${file_counter}`);
              decompressedStream = fs.createWriteStream(newFilePath, {
                flags: 'a',
              });

              start += fileLength;
              fileLength = 0;
              total_chunk_counter += these_chunks_counter;
              these_chunks_counter = 0;

              console.log(
                `${these_chunks_counter} chunks decompressed with decompressed size ${
                  fileLength / 1024 / 1024
                } MB`
              );
            }

            // Stop decompression if the size of the combined decompressed files exceeds the decompressed total combined files size limit
            if (batch_files_total_decompressed_size >= decompressedSizeLimit) {
              console.log(`Decompression limit met. Ending decompression...`);
              console.log(`Temp files being analyzed: ${filesBeingAnalyzed}`);
              result.removeAllListeners('data');
              result.removeAllListeners('error');
              result.end();
              resolve(); // Resolve the promise to allow the 'end' event to handle the analysis
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
