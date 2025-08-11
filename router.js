import { listTasks, createTask, deleteTask, completeTask } from './controller.js';
import logger from './logger.js';

export function handle(req, res) {
  const urlParts = req.url.split('/');
  
  logger.emit('log', 'info', `Received request: ${req.method} ${req.url}`);

  if (req.url === '/todos' && req.method === 'GET') {
    listTasks(req, res);
  } 
  else if (req.url === '/todos' && req.method === 'POST') {
    createTask(req, res);
  } 
  else if (urlParts[1]==="todos" && req.method === 'DELETE') {
    const id = urlParts[2];
    deleteTask(req, res, id);
  } 
  else if (urlParts[1] === "todos" && urlParts[3] === 'complete' && req.method === 'PATCH') {
    const id = urlParts[2];
    completeTask(req, res, id);
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
}
