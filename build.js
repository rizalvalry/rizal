'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, process.env.CV_SOURCE || 'Muhamad Rizal - Web CV.html');
const OUT = path.join(__dirname, 'index.html');
const FROM = '<title>Bundled Page</title>';
const TO = '<title>Muhamad Rizal — Curriculum Vitae</title>';

const src = fs.readFileSync(SRC, 'utf8');
const occurrences = src.split(FROM).length - 1;
if (occurrences !== 1) {
  console.error(`BUILD GAGAL: marker title ditemukan ${occurrences}x, harus tepat 1x.`);
  process.exit(1);
}
fs.writeFileSync(OUT, src.replace(FROM, TO));
console.log(`index.html dibuat (${fs.statSync(OUT).size} bytes, source ${fs.statSync(SRC).size} bytes)`);
