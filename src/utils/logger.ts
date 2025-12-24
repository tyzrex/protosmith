export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  debug(...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.log("\x1b[36m[DEBUG]\x1b[0m", ...args);
    }
  }

  info(...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.log("\x1b[32m[INFO]\x1b[0m", ...args);
    }
  }

  warn(...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.log("\x1b[33m[WARN]\x1b[0m", ...args);
    }
  }

  error(...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error("\x1b[31m[ERROR]\x1b[0m", ...args);
    }
  }

  success(...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.log("\x1b[32m✓\x1b[0m", ...args);
    }
  }

  step(step: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.log(`\x1b[35m[${step}]\x1b[0m`, ...args);
    }
  }
}

export const logger = new Logger();
