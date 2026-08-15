'use strict';
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

// Semua koordinat koneksi (host, port, user, password) dibaca dari file di luar repo.
// Format yang diharapkan: baris "ssh -p <port> <user>@<host>", lalu baris "Password"
// yang diikuti password pada baris berikutnya.
const AUTH_FILE = process.env.CV_AUTH_FILE || 'D:\\laragon\\www\\ssh\\auth.md';
const DOMAIN = 'rafancloud.com';
const SUBPATH = 'rizal';
const LOCAL_DIR = __dirname;
const UPLOAD_ONLY = ['index.html', '.htaccess'];

// File remote di luar whitelist hanya dihapus jika dinamai eksplisit:
//   node deploy.js --remove default.php
const REMOVE = (() => {
  const i = process.argv.indexOf('--remove');
  return i === -1 ? [] : process.argv.slice(i + 1).filter(a => !a.startsWith('--'));
})();

function readAuth() {
  const lines = fs.readFileSync(AUTH_FILE, 'utf8').split(/\r?\n/);

  const conn = lines.map(l => l.match(/^\s*ssh\s+-p\s+(\d+)\s+([^@\s]+)@(\S+)/)).find(Boolean);
  if (!conn) throw new Error(`Baris "ssh -p <port> <user>@<host>" tidak ditemukan di ${AUTH_FILE}`);

  const marker = lines.findIndex(l => /^password$/i.test(l.trim()));
  if (marker === -1) throw new Error(`Marker "Password" tidak ditemukan di ${AUTH_FILE}`);
  const password = lines[marker + 1];
  if (!password || !password.trim()) throw new Error(`Password kosong di ${AUTH_FILE}`);

  return { port: Number(conn[1]), username: conn[2], host: conn[3], password: password.trim() };
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('data', d => { out += d; });
      stream.stderr.on('data', d => { errOut += d; });
      stream.on('close', code => resolve({ code, out, errOut }));
    });
  });
}

function put(sftp, local, remote) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(local, remote, err => (err ? reject(err) : resolve()));
  });
}

(async () => {
  const { host, port, username, password } = readAuth();
  const remoteDir = `/home/${username}/domains/${DOMAIN}/public_html/${SUBPATH}`;

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject)
      .connect({ host, port, username, password, readyTimeout: 30000 });
  });
  console.log('[1/5] connected');

  const mk = await exec(conn, `mkdir -p '${remoteDir}'`);
  if (mk.code !== 0) throw new Error('mkdir gagal: ' + mk.errOut);
  console.log('[2/5] remote dir siap');

  const existing = await exec(conn, `ls -A '${remoteDir}'`);
  const present = existing.out.split(/\r?\n/).map(n => n.trim()).filter(Boolean);

  for (const name of REMOVE.filter(n => present.includes(n))) {
    const rm = await exec(conn, `rm -f '${remoteDir}/${name}'`);
    if (rm.code !== 0) throw new Error(`rm ${name} gagal: ${rm.errOut}`);
    console.log(`      removed ${name}`);
  }

  const foreign = present.filter(n => !UPLOAD_ONLY.includes(n) && !REMOVE.includes(n));
  if (foreign.length) {
    throw new Error(
      'Remote dir sudah berisi file di luar whitelist, deploy dibatalkan agar tidak menimpa:\n  ' +
      foreign.join('\n  ')
    );
  }
  console.log('[3/5] remote dir aman (tidak ada konten asing)');

  const sftp = await new Promise((res, rej) =>
    conn.sftp((e, s) => (e ? rej(e) : res(s))));

  for (const name of UPLOAD_ONLY) {
    const local = path.join(LOCAL_DIR, name);
    if (!fs.existsSync(local)) throw new Error('File hilang: ' + local);
    await put(sftp, local, `${remoteDir}/${name}`);
    console.log(`      uploaded ${name} (${fs.statSync(local).size} bytes)`);
  }
  console.log('[4/5] upload selesai');

  const targets = UPLOAD_ONLY.map(n => `'${remoteDir}/${n}'`).join(' ');
  await exec(conn, `chmod 755 '${remoteDir}' && chmod 644 ${targets}`);
  const ls = await exec(conn, `ls -la '${remoteDir}'`);
  console.log('[5/5] verifikasi remote:\n' + ls.out);

  conn.end();
})().catch(e => { console.error('DEPLOY GAGAL:', e.message); process.exit(1); });
