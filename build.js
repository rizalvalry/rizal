'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, process.env.CV_SOURCE || 'Muhamad Rizal - Web CV.html');
const OUT = path.join(__dirname, 'index.html');
const TEMPLATE_RE = /(<script type="__bundler\/template">)([\s\S]*?)(<\/script>)/;
const TITLE_FROM = '<title>Bundled Page</title>';
const TITLE_TO = '<title>Muhamad Rizal — Curriculum Vitae</title>';

function fail(msg, detail) {
  console.error('BUILD GAGAL: ' + msg);
  if (detail) console.error('  ' + detail);
  process.exit(1);
}

function replaceOnce(text, from, to, label) {
  const n = text.split(from).length - 1;
  if (n !== 1) {
    fail(
      `patch "${label}" mencocokkan ${n} lokasi, harus tepat 1.`,
      'anchor: ' + from.slice(0, 140) + (from.length > 140 ? ' …' : '')
    );
  }
  return text.split(from).join(to);
}

// Template disimpan sebagai JSON string di dalam <script>, dengan setiap "</" di-escape jadi
// "</" supaya tidak menutup tag script lebih awal. encode() harus mereproduksi konvensi itu.
const encode = html => JSON.stringify(html).replace(/<\//g, '<\\u002F');

const src = fs.readFileSync(SRC, 'utf8');
const m = src.match(TEMPLATE_RE);
if (!m) fail('blok <script type="__bundler/template"> tidak ditemukan di ' + path.basename(SRC));

const rawFull = m[2];
const lead = rawFull.match(/^\s*/)[0];
const trail = rawFull.match(/\s*$/)[0];
const raw = rawFull.trim();

let html;
try {
  html = JSON.parse(raw);
} catch (e) {
  fail('template bukan JSON string yang valid.', e.message);
}

// Tolak menulis apa pun kalau encoder tidak bisa mereproduksi input asli byte-for-byte —
// itu tanda konvensi escaping exporter berubah dan patch tidak lagi bisa dipercaya.
if (encode(html) !== raw) fail('round-trip template tidak byte-exact; konvensi escaping exporter berubah.');

const patches = require('./content-patches');
for (const p of patches) html = replaceOnce(html, p.from, p.to, p.name);

let out = src.replace(TEMPLATE_RE, (_, open, __, close) => open + lead + encode(html) + trail + close);
out = replaceOnce(out, TITLE_FROM, TITLE_TO, 'title');

fs.writeFileSync(OUT, out);
console.log(
  `index.html dibuat (${fs.statSync(OUT).size} bytes, source ${fs.statSync(SRC).size} bytes, ` +
  `${patches.length} patch diterapkan)`
);
