'use strict';

// Re-hue base accent: orange #c67139 (palet bawaan template) -> cyan brand rafancloud.com.
//
// Metode: lightness setiap token DIPERTAHANKAN persis, hanya hue (190°, di antara
// Tailwind cyan-400 dan cyan-500 yang dipakai rafancloud.com) dan saturation yang digeser.
// Konsekuensinya struktur tonal, urutan ramp, dan relasi kontras desain aslinya tidak
// bergeser sama sekali — shadow, varian, dan gradient tetap memakai token yang sama.
//
// Yang SENGAJA tidak disentuh: --color-accent-2 (olive #7a8a5e) dan seluruh ramp netral
// yang masih hangat. Instruksinya hanya mengganti base color orange.

const BASE = '#16c6e9';        // L 50.0% — identik dengan L orange lama #c67139
const BASE_RGB = '22,198,233'; // untuk rgba() yang menuliskan base secara hardcoded

const LIGHT = ['#ebfbff', '#d1f6fe', '#a7eefd', '#66e2fb', '#25d6f9', '#0cb2d3', '#0488a2', '#036073', '#04404c'];
const DARK  = ['#0b3a44', '#0d4d5a', '#106b7d', '#0da8c7', '#16c6e9', '#31d8fa', '#61e1fb', '#8feafc', '#c1f3fd'];

const OLD_LIGHT = ['#fff2eb', '#ffe1d0', '#ffc6a5', '#f6a06b', '#d67f48', '#b2622d', '#8c491a', '#643312', '#402310'];
const OLD_DARK  = ['#3a2114', '#4d2b1a', '#6b3b22', '#a85c2c', '#c67139', '#d98b52', '#e8a674', '#f2c299', '#fadfc4'];

const step = i => (i + 1) * 100;

// Light mode: satu deklarasi per baris, indent 2 spasi, ada spasi setelah titik dua.
const lightRamp = ramp => ramp.map((c, i) => `  --color-accent-${step(i)}: ${c};`).join('\n');

// Dark mode: dirapatkan tiga token per baris, indent 4 spasi, tanpa spasi setelah titik dua.
const darkRamp = ramp =>
  [0, 3, 6].map(o => '    ' + ramp.slice(o, o + 3).map((c, i) => `--color-accent-${step(o + i)}:${c};`).join(' ')).join('\n');

module.exports = [
  {
    name: 'accent-base-light',
    from: '  --color-accent: #c67139;',
    to: `  --color-accent: ${BASE};`,
  },
  {
    name: 'accent-ramp-light',
    from: lightRamp(OLD_LIGHT),
    to: lightRamp(LIGHT),
  },
  {
    name: 'accent-base-dark',
    from: '--color-accent:#c67139; --color-accent-2:#7a8a5e;',
    to: `--color-accent:${BASE}; --color-accent-2:#7a8a5e;`,
  },
  {
    name: 'accent-ramp-dark',
    from: darkRamp(OLD_DARK),
    to: darkRamp(DARK),
  },
  {
    // 6 shadow/glow menuliskan base sebagai rgba literal. Bentuk, offset, blur dan alpha
    // dibiarkan apa adanya — hanya komponen warnanya yang ikut base baru.
    name: 'accent-rgba-shadows',
    from: 'rgba(198,113,57,',
    to: `rgba(${BASE_RGB},`,
    count: 6,
  },
];
