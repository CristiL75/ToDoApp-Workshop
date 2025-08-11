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
  // Content-Type validation
  if (req.headers['content-type'] !== 'application/json') {
    logger.emit('log', 'error', 'Task creation failed: Content-Type must be application/json');
    res.writeHead(415, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Content-Type must be application/json' }));
    return;
  }
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      // Check for missing title
      if (!data.title) {
        logger.emit('log', 'error', 'Task creation failed: Title is required');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Title is required' }));
        return;
      }
      // Type validation
      if (typeof data.title !== 'string' || (data.description && typeof data.description !== 'string')) {
        logger.emit('log', 'error', 'Task creation failed: Title and description must be strings');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Title and description must be strings' }));
        return;
      }
      if ('done' in data && typeof data.done !== 'boolean') {
        logger.emit('log', 'error', 'Task creation failed: Done must be boolean');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Done must be boolean' }));
        return;
      }
      // Length validation
      if (data.title.length < 3 || data.title.length > 100) {
        logger.emit('log', 'error', 'Task creation failed: Title must be between 3 and 100 characters');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Title must be between 3 and 100 characters' }));
        return;
      }
      if (data.description && data.description.length > 500) {
        logger.emit('log', 'error', 'Task creation failed: Description too long');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Description too long' }));
        return;
      }
      // Check for extra/invalid fields (optional)
      const allowedFields = ['title', 'description', 'done', 'dateToModify'];
      const invalidFields = Object.keys(data).filter(k => !allowedFields.includes(k));
      if (invalidFields.length > 0) {
        logger.emit('log', 'error', 'Task creation failed: Invalid fields: ' + invalidFields.join(', '));
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid fields: ' + invalidFields.join(', ') }));
        return;
      }
      // Date validation
      if (data.dateToModify) {
        const date = new Date(data.dateToModify);
        if (isNaN(date.getTime()) || date < new Date()) {
          logger.emit('log', 'error', 'Task creation failed: dateToModify must be a valid future date');
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'dateToModify must be a valid future date' }));
          return;
        }
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
  // Validare id
  if (!id || typeof id !== 'string' || id.trim() === '') {
    logger.emit('log', 'error', 'Task completion failed: Invalid or missing id');
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid or missing id' }));
    return;
  }
  const todos = getAll();
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    logger.emit('log', 'error', `Task completion failed: Task with ID ${id} not found`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Task not found' }));
    return;
  }
  if (todo.done) {
    logger.emit('log', 'error', `Task completion failed: Task with ID ${id} is already completed`);
    res.writeHead(409, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Task is already completed' }));
    return;
  }
  markComplete(id);
  logger.emit('log', 'info', `Marked task with ID: ${id} as complete`);
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
        logger.emit('log', 'error', 'Task date update failed: dateToModify is required');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Date to modify is required' }));
        return;
      }
      
      // Anulează timeout-ul existent pentru acest task
      cancelTaskTimeout(id);
      
      const todo = updateDateToModify(id, data.dateToModify);
      if (!todo) {
        logger.emit('log', 'error', `Task date update failed: Task with ID ${id} not found`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Task not found' }));
        return;
      }
      
      // Re-programează toate timeout-urile după actualizarea datei
      scheduleTaskCompletion();
      
      logger.emit('log', 'info', `Updated dateToModify for task with ID: ${id} to ${data.dateToModify}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(todo));
    } catch {
      logger.emit('log', 'error', 'Task date update failed: Invalid JSON');
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
        logger.emit('log', 'error', 'Task delay update failed: Valid delayInSeconds (positive number) is required');
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
        logger.emit('log', 'error', `Task delay update failed: Task with ID ${id} not found`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Task not found' }));
        return;
      }
      
      // Re-programează toate timeout-urile după actualizarea datei
      scheduleTaskCompletion();
      
      console.log(`Task "${todo.title}" will auto-complete in ${data.delayInSeconds} seconds at ${futureDate.toLocaleString()}`);
      
      logger.emit('log', 'info', `Set delay for task with ID: ${id} to ${data.delayInSeconds} seconds`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(todo));
    } catch {
      logger.emit('log', 'error', 'Task delay update failed: Invalid JSON');
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
}