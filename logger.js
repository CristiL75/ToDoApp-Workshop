import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';

class Logger extends EventEmitter {}

const logger = new Logger();

const logFilePath = path.join(process.cwd(), 'log.txt');

logger.on('log', (level, message) => {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level.toUpperCase()}]: ${message}\n`;

  process.stdout.write(logLine);

  fs.appendFile(logFilePath, logLine, err => {
    if (err) {
      process.stderr.write(`Failed to write log: ${err.message}\n`);
    }
  });
});

export default logger;
