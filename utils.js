import { getAll, markComplete } from './model.js';

// Obiect pentru a stoca timeout-urile active
const activeTimeouts = new Map();

/**
 * Funcție care procesează toate task-urile și creează timeout-uri pentru cele cu dateToModify în viitor
 */
export function scheduleTaskCompletion() {
  const todos = getAll();
  const now = new Date();
  
  todos.forEach(todo => {
    // Verifică dacă task-ul are dateToModify setat și este în viitor
    if (todo.dateToModify && todo.dateToModify !== null && !todo.done) {
      const modifyDate = new Date(todo.dateToModify);
      
      // Verifică dacă data este în viitor
      if (modifyDate > now) {
        // Calculează timpul de așteptare în milisecunde
        const timeToWait = modifyDate.getTime() - now.getTime();
        
        // Anulează timeout-ul existent pentru acest task dacă există
        if (activeTimeouts.has(todo.id)) {
          clearTimeout(activeTimeouts.get(todo.id));
        }
        
        // Creează un nou timeout
        const timeoutId = setTimeout(() => {
          console.log(`Auto-completing task: ${todo.title} (ID: ${todo.id})`);
          markComplete(todo.id);
          activeTimeouts.delete(todo.id);
        }, timeToWait);
        
        // Stochează timeout-ul pentru a putea fi anulat dacă este necesar
        activeTimeouts.set(todo.id, timeoutId);
        
        console.log(`Scheduled auto-completion for task "${todo.title}" at ${modifyDate.toLocaleString()}`);
      }
    }
  });
}

/**
 * Funcție pentru a anula timeout-ul unui task specific
 */
export function cancelTaskTimeout(taskId) {
  if (activeTimeouts.has(taskId)) {
    clearTimeout(activeTimeouts.get(taskId));
    activeTimeouts.delete(taskId);
    console.log(`Cancelled auto-completion timeout for task ID: ${taskId}`);
    return true;
  }
  return false;
}

/**
 * Funcție pentru a anula toate timeout-urile active
 */
export function cancelAllTimeouts() {
  activeTimeouts.forEach((timeoutId, taskId) => {
    clearTimeout(timeoutId);
    console.log(`Cancelled timeout for task ID: ${taskId}`);
  });
  activeTimeouts.clear();
}

/**
 * Funcție pentru a obține informații despre timeout-urile active
 */
export function getActiveTimeouts() {
  return Array.from(activeTimeouts.keys());
}