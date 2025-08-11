const controller = require('./controller');

exports.handle = (req, res) => {
  if (req.url === '/todos' && req.method === 'GET') {
    controller.listTasks(req, res);
  } else if (req.url === '/todos' && req.method === 'POST') {
    controller.createTask(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
};
