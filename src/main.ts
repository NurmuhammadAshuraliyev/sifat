import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

// 👉 Swagger import
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

    // 👉 Swagger config (qo‘shildi)
    const config = new DocumentBuilder()
      .setTitle('My API')
      .setDescription('API documentation')
      .setVersion('1.0')
      .addBearerAuth() // agar JWT ishlatsang
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document);
    // 👉 http://localhost:3000/docs da ochiladi

    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    logger.error(error);
  }
}
bootstrap();
