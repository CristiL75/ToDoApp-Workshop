import http from 'http';
import { handle } from './router.js';
import { scheduleTaskCompletion } from './utils.js';
import logger from './logger.js';

const server = http.createServer((req, res) => {
  handle(req, res);
});

server.listen(3000, () => {
  logger.emit('log', 'info', 'Server is running on http://localhost:3000');
  // Inițializează timeout-urile pentru task-urile existente cu dateToModify
  scheduleTaskCompletion();
  console.log('Task auto-completion scheduling initialized');
});
