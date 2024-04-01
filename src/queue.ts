import * as asyncLib from 'async';
import * as fs from 'fs';
import * as net from 'net';
// will just write to wherever the process is running, but the server needs to be launched from the same directory so we use an abs path
export const RESULTS_PATH = `${__dirname}/results.json`;

function launchQueueServer() {
  // ensure results.json exists
  if (!fs.existsSync(RESULTS_PATH)) {
    fs.writeFileSync(RESULTS_PATH, '{}');
  }

  // Create a write to result.json queue with a concurrency of 1
  // Possibly the simplest fix would be to run this as a separate process, then we can enforce messages sent to this queue are processed in order
  const queue = asyncLib.queue<any>((task, callback) => {
    const { analysisKey, results } = task;
    console.log('received task', analysisKey);

    // read the results from aggregate results.json
    const fileContent = fs.readFileSync(RESULTS_PATH, 'utf8');
    const existingResults = JSON.parse(fileContent);
    existingResults[analysisKey] = results;

    try {
      fs.writeFileSync(RESULTS_PATH, JSON.stringify(existingResults, null, 2));
      console.log(`"${analysisKey}" written to ${RESULTS_PATH}`);
      callback();
    } catch (err) {
      console.error('Error writing to results.json', err);
      callback(err);
    }
  }, 1);

  queue.drain(function () {
    console.log('no more tasks to process');
  });

  // this event listener receives tasks from the parallel processes
  const server = net.createServer((socket) => {
    socket.on('data', (data) => {
      const task = JSON.parse(data.toString());
      queue.push(task);
    });
  });

  console.log('Queue server listening on port 8000');
  server.listen(8000);
}

// for use with zst_decompresser.js
if (require.main === module) {
  launchQueueServer();
}
