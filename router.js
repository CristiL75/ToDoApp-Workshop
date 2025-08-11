import { listTasks, createTask, deleteTask, completeTask, updateTaskDate, setTaskDelay } from './controller.js';
import logger from './logger.js';

export function handle(req, res) {
    if (req.method === 'PUT') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'PUT method not allowed' }));
      return;
    }
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
  else if (urlParts[1] === "todos" && urlParts[3] === 'date' && req.method === 'PATCH') {
    const id = urlParts[2];
    updateTaskDate(req, res, id);
  }
  else if (urlParts[1] === "todos" && urlParts[3] === 'delay' && req.method === 'PATCH') {
    const id = urlParts[2];
    setTaskDelay(req, res, id);
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
}
