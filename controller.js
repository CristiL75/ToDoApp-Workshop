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

export function updateTaskDate(req, res, id) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (!data.dateToModify) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Date to modify is required' }));
        return;
      }
      
      // Anulează timeout-ul existent pentru acest task
      cancelTaskTimeout(id);
      
      const todo = updateDateToModify(id, data.dateToModify);
      if (!todo) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Task not found' }));
        return;
      }
      
      // Re-programează toate timeout-urile după actualizarea datei
      scheduleTaskCompletion();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(todo));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
}

export function setTaskDelay(req, res, id) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (!data.delayInSeconds || typeof data.delayInSeconds !== 'number' || data.delayInSeconds <= 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Valid delayInSeconds (positive number) is required' }));
        return;
      }
      
      // Calculează dateToModify bazat pe timpul curent + delay în secunde
      const now = new Date();
      const futureDate = new Date(now.getTime() + (data.delayInSeconds * 1000));
      const dateToModify = futureDate.toISOString();
      
      // Anulează timeout-ul existent pentru acest task
      cancelTaskTimeout(id);
      
      const todo = updateDateToModify(id, dateToModify);
      if (!todo) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Task not found' }));
        return;
      }
      
      // Re-programează toate timeout-urile după actualizarea datei
      scheduleTaskCompletion();
      
      console.log(`Task "${todo.title}" will auto-complete in ${data.delayInSeconds} seconds at ${futureDate.toLocaleString()}`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(todo));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
}