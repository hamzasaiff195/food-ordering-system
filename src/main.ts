import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as os from 'os';
import cluster from 'cluster';
import morgan from 'morgan';

// ⚡ Working imports for TS
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const numCPUs = os.cpus().length;
  console.log(`Total CPUs: ${numCPUs}`);

  if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    const app = await NestFactory.create(AppModule);

    // -----------------------------
    // SECURITY MIDDLEWARE
    // -----------------------------
    app.use(helmet());
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: false,
    });
    // -----------------------------
    // RATE LIMITING
    // -----------------------------
    app.use(
      rateLimit({
        windowMs:
          Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000, // 15 min
        max: Number(process.env.RATE_LIMIT_MAX || 100), // max requests per IP
        standardHeaders: true, // Return rate limit info in headers
        legacyHeaders: false, // Disable `X-RateLimit-*` headers
        message: 'Too many requests from this IP, please try again later.',
      }),
    );

    // -----------------------------
    // LOGGING
    // -----------------------------
    app.use(morgan('dev'));

    // -----------------------------
    // OPTIONAL: Global API prefix
    // -----------------------------
    // app.setGlobalPrefix('api/v1');

    // -----------------------------
    // START SERVER
    // -----------------------------
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Worker ${process.pid} started on port ${port}`);
  }
}

bootstrap();
