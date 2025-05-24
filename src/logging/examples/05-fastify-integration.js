import Fastify from 'fastify';
import { createLogger } from '../logger.js';

let appLogger;
let fastifyInstance;

async function startFastifyApp() {
  appLogger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    dirname: 'logs',
    filename: 'fastify-app.log',
    retentionDays: 7,
    maxSize: 10485760, // 10MB
  });

  const fastifyLoggerOptions = {
    logger: null,
    level: appLogger.level,
    customFactory: (factoryLogLevel, factoryLogStream) => {
      return {
        fatal: (msg, meta) =>
          appLogger.error(msg, { ...meta, fastifyLevel: 'fatal' }),
        error: (msg, meta) => appLogger.error(msg, meta),
        warn: (msg, meta) => appLogger.warn(msg, meta),
        info: (msg, meta) => appLogger.info(msg, meta),
        debug: (msg, meta) => appLogger.debug(msg, meta),
        trace: (msg, meta) =>
          appLogger.debug(msg, { ...meta, fastifyLevel: 'trace' }),
        silent: () => {},
        child: (bindings) => appLogger.child(bindings),
      };
    },
  };

  fastifyInstance = Fastify({
    ...fastifyLoggerOptions,
  });

  fastifyInstance.get('/', async (request, reply) => {
    request.log.info('Incoming request to root path');
    reply.send({ hello: 'world' });
  });

  fastifyInstance.get('/error', async (request, reply) => {
    request.log.error('Simulating an error in /error route');
    throw new Error('This is an intentional error from Fastify route');
  });

  try {
    await fastifyInstance.listen({ port: 3000 });
    appLogger.info('Fastify server listening on port 3000');
  } catch (err) {
    fastifyInstance.log.error(err);
    process.exit(1);
  }
}

startFastifyApp();

const cleanupAndExit = async () => {
  process.removeAllListeners('SIGINT');
  process.removeAllListeners('SIGTERM');

  console.log('Initiating graceful shutdown...');

  if (fastifyInstance) {
    try {
      console.log('Attempting to close Fastify server...');
      await fastifyInstance.close();
      console.log('Fastify server closed successfully.');
    } catch (err) {
      console.error('Error closing Fastify server:', err);
    }
  }

  if (appLogger) {
    try {
      console.log('Attempting to flush and close app logger...');
      await appLogger.flush();
      await appLogger.close();
      console.log('App logger flushed and closed successfully.');
    } catch (err) {
      console.error(
        'Error flushing/closing app logger:',
        err.message,
        err.stack
      );
    }
  }

  console.log(
    'All major services reportedly closed. Exiting process in 100ms...'
  );
  setTimeout(() => {
    process.exit(0);
  }, 100);
};

process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);
