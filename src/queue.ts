import * as asyncLib from 'async';
import * as fs from 'fs';
import * as net from 'net';
// will just write to wherever the process is running, but the server needs to be launched from the same directory so we use an abs path
export const RESULTS_PATH = `${__dirname}/results.json`;

function launchQueueServer() {
  // Create a write to result.json queue with a concurrency of 1
  // Possibly the simplest fix would be to run this as a separate process, then we can enforce messages sent to this queue are processed in order
  const queue = asyncLib.queue<any>((task) => {
    console.log('received task', task.analysisKey);
    return new Promise<void>((resolve, reject) => {
      const { results, analysisKey } = task;
      try {
        fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
        console.log(
          `Analysis "${analysisKey}" has been written to ${RESULTS_PATH}`
        );
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }, 1);

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
