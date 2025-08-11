import { getAll, create, remove, markComplete, updateDateToModify } from './model.js';
import { scheduleTaskCompletion, cancelTaskTimeout } from './utils.js';

export function listTasks(req, res) {
  const todos = getAll();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(todos));
}

export function createTask(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (!data.title) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Title is required' }));
        return;
      }
      const todo = create(data.title, data.description || '', data.dateToModify || null);
      
      // Re-programează toate timeout-urile după crearea unui nou task
      scheduleTaskCompletion();
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(todo));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
}

export function deleteTask(req, res, id) {
  // Anulează timeout-ul pentru acest task înainte de a-l șterge
  cancelTaskTimeout(id);
  
  const success = remove(id);
  if (!success) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Task not found' }));
    return;
  }
  res.writeHead(204);
  res.end();
}

export function completeTask(req, res, id) {
  // Anulează timeout-ul pentru acest task înainte de a-l marca ca fiind completat
  cancelTaskTimeout(id);
  
  const todo = markComplete(id);
  if (!todo) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Task not found' }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(todo));
}