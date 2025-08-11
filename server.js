import http from 'http';
import { handle } from './router.js';

const server = http.createServer((req, res) => {
  handle(req, res);
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
