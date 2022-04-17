import winston, { format, Logger } from 'winston'

export default function getOrCreateLogger(name: string): Logger {
  if (winston.loggers.has(name)) {
    return winston.loggers.get(name);
  }
  return winston.loggers.add(name, {
    level: 'info',
    format: format.combine(
      format.timestamp(),
      format.label({ label: name }),
      format.printf(({ timestamp, level, label, message }) => {
        return `${timestamp} [${level.toUpperCase().padStart(5, " ")}] ${label?.padStart(5, " ")}: ${message}`;
      }),
      format.colorize({ all: true }),
    ),
    transports: [
      new winston.transports.Console(),
    ]
  });
}
