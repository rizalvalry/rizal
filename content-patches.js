'use strict';

// Patch konten yang diterapkan build.js ke blok __bundler/template dari file source.
//
// Kenapa ada file ini: "Muhamad Rizal - Web CV.html" adalah artefak export dari editor —
// setiap kali di-export ulang, editan manual di dalamnya hilang. Patch di sini dijalankan
// ulang pada setiap build, jadi perubahan bertahan lintas re-export.
//
// Setiap `from` WAJIB cocok tepat 1x. Kalau source berubah sampai anchor tidak unik atau
// hilang, build sengaja gagal — lebih baik berhenti daripada diam-diam menghasilkan
// index.html yang setengah ter-patch.

const A = 'var(--color-accent-600)';

const statBlock = (n, label) =>
  `<div><div class="stat" data-to="${n}" style="font-family:var(--font-heading); font-size:clamp(34px,5vw,54px); line-height:1; color:${A};">0</div>` +
  `<div style="font-size:12px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-500); margin-top:8px;">${label}</div></div>`;

const link = (href, text) =>
  `<a href="${href}" target="_blank" rel="noopener" style="color:${A}; text-decoration:none; border-bottom:1px solid var(--color-accent-300);">${text}</a>`;

module.exports = [
  {
    name: 'hero-roles',
    from: 'Senior Backend Engineer. Ten years turning',
    to: 'Senior Backend Engineer · IT Consultant Owner. Ten years turning',
  },

  {
    name: 'hero-rafancloud-tag',
    from: '<a class="tag" href="https://shorturl.at/P3My5"',
    to:
      '<a class="tag" href="https://rafancloud.com" target="_blank" rel="noopener" style="padding:9px 18px; font-size:13px;">rafancloud.com</a>\n' +
      '          <a class="tag" href="https://shorturl.at/P3My5"',
  },

  {
    name: 'hero-stat-clients',
    from: '<div><div class="stat" data-to="17"',
    to: statBlock(21, 'Clients since 2017') + '\n      <div><div class="stat" data-to="17"',
  },

  {
    name: 'intro-lead',
    from:
      'Web-technology expert with 10+ years across web, mobile, IoT and AI — currently building ' +
      'drone imaging systems, distributed microservices and cloud-native AI pipelines at ' +
      `<span style="color:${A};">PT Berlian Sistem Informasi</span>.`,
    to:
      'Master developer and solution architect — a decade of shipping production platforms across ' +
      'web, internal applications, IoT, SaaS and cloud infrastructure, in whatever language or ' +
      'framework the problem actually calls for.',
  },

  {
    name: 'intro-consultancy',
    from:
      "Bachelor's in Computer Software &amp; Media Applications. Full-stack development, project " +
      'management, penetration &amp; performance testing and API architecture, with leadership as ' +
      'CTO, Tech Lead and business owner.',
    to:
      `Founder and owner of ${link('https://rafancloud.com', 'rafancloud.com')} — the independent ` +
      'IT consultancy I have grown since 2017 to 21 clients I still serve today, winning and ' +
      'keeping each engagement myself, from first outreach and technical discovery through ' +
      'architecture, delivery and long-term support.' +
      '</p>\n' +
      '    <p data-reveal="" style="--d:240ms; font-size:15px; line-height:1.7; color:var(--color-neutral-600); margin:18px 0 0; max-width:720px; text-wrap:pretty;">' +
      "Bachelor's in Computer Software &amp; Media Applications. Full-stack development, project " +
      'management, penetration &amp; performance testing and API architecture, with leadership as ' +
      'CTO, Tech Lead and business owner across a wide range of industries.',
  },
];
