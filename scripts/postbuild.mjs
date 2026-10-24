// Overwrites build/index.html with a static language-redirect page (D-16).
// The target is only ever /en/, /de/ or /ru/ (fixed allowlist); stored values are used
// purely as strict-equality allowlist checks (no object lookup, so prototype keys never match), query/hash are appended after a same-origin absolute path.
import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('build', 'index.html');
if (!fs.existsSync(file)) {
	console.error('postbuild: build/index.html not found, run vite build first');
	process.exit(1);
}

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Duck Math</title><meta name="robots" content="noindex">
<link rel="alternate" hreflang="en" href="/en/"><link rel="alternate" hreflang="de" href="/de/"><link rel="alternate" hreflang="ru" href="/ru/">
<style>html{background:#0f1117;color-scheme:dark}</style>
<script>(function(){function ok(x){return x==='en'||x==='de'||x==='ru'}var s=null;try{s=localStorage.getItem('dm-locale')}catch(e){}
var l=ok(s)?s:null;if(!l){var n=navigator.languages||[navigator.language||''];for(var i=0;i<n.length;i++){var c=String(n[i]).slice(0,2).toLowerCase();if(ok(c)){l=c;break}}}
location.replace('/'+(l||'en')+'/'+location.search+location.hash)})();</script>
<noscript><meta http-equiv="refresh" content="0;url=/en/"></noscript>
</head><body><noscript><a href="/en/">English</a> · <a href="/de/">Deutsch</a> · <a href="/ru/">Русский</a></noscript></body></html>
`;

fs.writeFileSync(file, html);
console.log('postbuild: root redirect written');
