// Local GitHub-Pages-like static server for build/. Dev/test only.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const port = Number(process.argv[2] ?? 4173);
const root = path.resolve(process.argv[3] ?? 'build');
const types = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.ttf': 'font/ttf',
	'.png': 'image/png',
	'.txt': 'text/plain; charset=utf-8'
};

function notFound(res) {
	let body = 'Not found';
	try {
		body = fs.readFileSync(path.join(root, '404.html'));
	} catch {}
	res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
	res.end(body);
}

http
	.createServer((req, res) => {
		const url = new URL(req.url ?? '/', 'http://localhost');
		let pathname;
		try {
			pathname = decodeURIComponent(url.pathname);
		} catch {
			res.writeHead(400).end();
			return;
		}
		// A decoded path such as //en (from /%2Fen) would make the trailing-slash redirect protocol-relative.
		if (pathname.startsWith('//') || url.pathname.startsWith('//')) return notFound(res);
		let file = path.resolve(root, '.' + pathname);
		if (file !== root && !file.startsWith(root + path.sep)) {
			res.writeHead(403).end('Forbidden');
			return;
		}
		let stat = fs.statSync(file, { throwIfNoEntry: false });
		if (stat?.isDirectory()) {
			if (!pathname.endsWith('/')) {
				// Build Location from the raw (still-encoded, single-leading-slash) pathname, never the decoded one.
			res.writeHead(301, { location: url.pathname + '/' + url.search }).end();
				return;
			}
			file = path.join(file, 'index.html');
			stat = fs.statSync(file, { throwIfNoEntry: false });
		}
		if (!stat?.isFile()) return notFound(res);
		res.writeHead(200, {
			'content-type': types[path.extname(file)] ?? 'application/octet-stream'
		});
		fs.createReadStream(file)
			.on('error', () => res.destroy())
			.pipe(res);
	})
	.listen(port, 'localhost');
