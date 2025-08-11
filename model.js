import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, 'todos.json');

function load() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE);
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

exports.getAll = () => {
  return load();
};

exports.create = (title, description) => {
  const todos = load();
  const todo = {
    id: generateId(),
    title,
    description,
    done: false
  };
  todos.push(todo);
  save(todos);
  return todo;
};
