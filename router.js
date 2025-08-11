import { listTasks, createTask } from './controller.js';


export function handle(req, res) {
  if (req.url === '/todos' && req.method === 'GET') {
    listTasks(req, res);
  } else if (req.url === '/todos' && req.method === 'POST') {
    createTask(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
}
