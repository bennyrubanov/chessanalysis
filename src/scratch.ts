// function to figure out how many games in the downloaded sets
const fs = require('fs');
const path = require('path');

let data = fs.readFileSync(path.join(__dirname, '../data/10.10.23_test_set'), 'utf8');
let games = data.split("\n\n");
console.log(`Number of games: ${games.length}`);