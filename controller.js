import model from './model.js';

exports.listTasks = (req, res) => {
  const todos = model.getAll();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(todos));
};

exports.createTask = (req, res) => {
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
      const todo = model.create(data.title, data.description || '');
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(todo));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
};
