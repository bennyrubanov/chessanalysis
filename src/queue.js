"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESULTS_PATH = void 0;
var asyncLib = require("async");
var fs = require("fs");
var net = require("net");
// will just write to wherever the process is running, but the server needs to be launched from the same directory so we use an abs path
exports.RESULTS_PATH = "".concat(__dirname, "/results.json");
function launchQueueServer() {
    // ensure results.json exists
    if (!fs.existsSync(exports.RESULTS_PATH)) {
        fs.writeFileSync(exports.RESULTS_PATH, '{}');
    }
    // Create a write to result.json queue with a concurrency of 1
    // Possibly the simplest fix would be to run this as a separate process, then we can enforce messages sent to this queue are processed in order
    var queue = asyncLib.queue(function (task, callback) {
        var analysisKey = task.analysisKey, results = task.results;
        console.log('received task', analysisKey);
        // read the results from aggregate results.json
        var fileContent = fs.readFileSync(exports.RESULTS_PATH, 'utf8');
        var existingResults = JSON.parse(fileContent);
        existingResults[analysisKey] = results;
        try {
            fs.writeFileSync(exports.RESULTS_PATH, JSON.stringify(existingResults, null, 2));
            console.log("\"".concat(analysisKey, "\" written to ").concat(exports.RESULTS_PATH));
            callback();
        }
        catch (err) {
            console.error('Error writing to results.json', err);
            callback(err);
        }
    }, 1);
    queue.drain(function () {
        console.log('no more tasks to process');
    });
    // this event listener receives tasks from the parallel processes
    var server = net.createServer(function (socket) {
        socket.on('data', function (data) {
            var task = JSON.parse(data.toString());
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
