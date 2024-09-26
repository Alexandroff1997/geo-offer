import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useLogger(['log', 'error', 'warn']);

  const config = new DocumentBuilder()
    .setTitle('Geo Offers API')
    .setDescription(
      'Geo Offer Service is an API for providing offers by GEO. The service receives data from a third-party source cityads.com, maps them into its own models and saves them in mongo.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(3000);
}
bootstrap();
