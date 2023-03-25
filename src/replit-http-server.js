import http from 'http';
import config from '../config.json' assert { type: 'json' };

if (config.replitAlwaysOnMode) {
  const server = http.createServer((_, res) => res.end(''));
  server.listen(3000);
}
