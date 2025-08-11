import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export function getAll() {
  return load();
}

export function create(title, description, dateToModify = null) {
  const todos = load();
  const todo = {
    id: generateId(),
    title,
    description,
    done: false,
    dateToModify: dateToModify
  };
  todos.push(todo);
  save(todos);
  return todo;
}

export function remove(id) {
  let todos = load();
  const initialLength = todos.length;
  todos = todos.filter(todo => todo.id !== id);
  if (todos.length === initialLength) return false; // not found
  save(todos);
  return true;
}

export function markComplete(id) {
  const todos = load();
  const todo = todos.find(t => t.id === id);
  if (!todo) return null;
  todo.done = true;
  save(todos);
  return todo;
}

export function updateDateToModify(id, dateToModify) {
  const todos = load();
  const todo = todos.find(t => t.id === id);
  if (!todo) return null;
  todo.dateToModify = dateToModify;
  save(todos);
  return todo;
}
