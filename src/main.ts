import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);

  try {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('/api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validationError: { target: false },
      }),
    );

    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      allowedHeaders: 'Content-Type, Authorization, Cookie',
      exposedHeaders: 'Set-Cookie',
    });

    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    logger.error(error);
  }
}
bootstrap();
