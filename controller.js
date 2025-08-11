import { getAll, create, remove, markComplete, updateDateToModify } from './model.js';
import { scheduleTaskCompletion, cancelTaskTimeout } from './utils.js';
import logger from './logger.js';

export function listTasks(req, res) {
  const todos = getAll();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  logger.emit('log', 'info', `Listed ${todos.length} tasks`);
  res.end(JSON.stringify(todos));
}

export function createTask(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (!data.title) {
        logger.emit('log', 'error', 'Task creation failed: Title is required');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Title is required' }));
        return;
      }
      const todo = create(data.title, data.description || '', data.dateToModify || null);
      logger.emit('log', 'info', `Created task with ID: ${todo.id}`);
      // Re-programează toate timeout-urile după crearea unui nou task
      scheduleTaskCompletion();
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(todo));
    } catch {
      logger.emit('log', 'error', 'Task creation failed: Invalid JSON');
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
    logger.emit('log', 'error', `Task deletion failed: Task with ID ${id} not found`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Task not found' }));
    return;
  }
  logger.emit('log', 'info', `Deleted task with ID: ${id}`);
  res.writeHead(204);
  res.end();
}

export function completeTask(req, res, id) {
  // Anulează timeout-ul pentru acest task înainte de a-l marca ca fiind completat
  cancelTaskTimeout(id);
  
  const todo = markComplete(id);
  if (!todo) {
    logger.emit('log', 'error', `Task completion failed: Task with ID ${id} not found`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Task not found' }));
    return;
  }
  logger.emit('log', 'info', `Marked task with ID: ${id} as complete`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(todo));
}