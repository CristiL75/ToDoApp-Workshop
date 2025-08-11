import http from 'http';
import { handle } from './router.js';
import { scheduleTaskCompletion } from './utils.js';

const server = http.createServer((req, res) => {
  handle(req, res);
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  
  // Inițializează timeout-urile pentru task-urile existente cu dateToModify
  scheduleTaskCompletion();
  console.log('Task auto-completion scheduling initialized');
});
