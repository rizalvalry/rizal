# CV Muhamad Rizal — static deploy

CV self-contained (satu file HTML, nol request eksternal) yang di-serve di
`https://rafancloud.com/rizal/`.

## Struktur

| File | Peran |
|---|---|
| `Muhamad Rizal CV.html` | Source asli. **Jangan diedit, tidak di-commit** (`.gitignore`). |
| `index.html` | Artefak yang di-deploy. Hasil generate dari source + `<title>` diganti. |
| `.htaccess` | DirectoryIndex, gzip, cache policy, security headers. |
| `deploy.js` | Deployer Node + `ssh2`. Upload whitelist saja. |

## Regenerate `index.html`

Jalankan ulang jika source berubah:

```bash
node -e "const fs=require('fs');const s=fs.readFileSync('Muhamad Rizal CV.html','utf8');fs.writeFileSync('index.html',s.replace('<title>Bundled Page</title>','<title>Muhamad Rizal — Curriculum Vitae</title>'))"
```

## Deploy ulang

```bash
npm install          # sekali saja, menarik ssh2
node deploy.js
```

`deploy.js` tidak memuat satu pun koordinat server. Host, port, username, dan password
dibaca saat runtime dari file di luar repo — default `D:\laragon\www\ssh\auth.md`, bisa
di-override lewat env `CV_AUTH_FILE`. Format yang diharapkan:

```
ssh -p <port> <user>@<host>
Password
<password>
```

Yang di-upload hanya `index.html` dan `.htaccess` (whitelist `UPLOAD_ONLY`). Script
membatalkan deploy jika direktori remote sudah berisi file lain, agar tidak menimpa
konten yang tidak dikenal.

## Verifikasi

```bash
curl -sSI https://rafancloud.com/rizal/
```

Harus `200 OK` dengan `content-type: text/html`.
