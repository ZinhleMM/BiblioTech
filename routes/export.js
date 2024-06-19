//simple proposal for exporting bookshelfs using fs and fast-csv

const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require('fast-csv');

const input = 'bookshelf';
const output = './exports/books.csv';

const query = `SELECT * FROM ${input}`;

global.db.all(query, (err, rows) => {
  if (err) {
    console.error('Error retrieving table:', err);
    global.db.close();
    return;
  }

  const csv = csv.format({ headers: true });
  const writable = fs.createWriteStream(output);

  writable.on('Done: ', () => {
    console.log('CSV file was successfully exported.');
    global.db.close();
  });

  csv.pipe(writable);
  rows.forEach(row => {
    csv.write(row);
  });

  csv.end();
});

module.exports = router;