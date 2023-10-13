// function to figure out how many games in the downloaded sets
const fs = require('fs');
const path = require('path');

let data = fs.readFileSync(path.join(__dirname, '../data/10.10.23_test_set'), 'utf8');
let games = data.split("\n[Event");
// If the first game doesn't start with a newline, add 1 back to the count
if (data.startsWith("[Event")) {
    console.log(`Number of games: ${games.length}`);
} else {
    console.log(`Number of games: ${games.length - 1}`); // Subtract 1 because the first split item will be an empty string
}