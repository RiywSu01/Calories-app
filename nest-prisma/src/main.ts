import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  // Increased the JSON body limit to 10mb for image uploads
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors();

  // Swagger OpenAPI 3.0 Configuration
  const config = new DocumentBuilder()
    .setTitle('CalPal REST API & FatSecret Integration')
    .setDescription(
      'Enterprise nutrition tracking backend powered by NestJS, Prisma PostgreSQL, Google Gemini Vision AI, and FatSecret Platform API with multi-tier rate limiting and 24-hour cache compliance.'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter Clerk Session JWT token (e.g. Bearer <token>)',
        in: 'header',
      },
      'clerk-auth',
    )
    .addTag('App', 'Root & health status endpoints')
    .addTag('Foods', 'Food database, custom user dishes, FatSecret food search & AI multimodal photo analysis')
    .addTag('Food Logs', 'Meal diary logs, macronutrient breakdowns & daily tracking')
    .addTag('Users', 'User accounts & administrative role management')
    .addTag('User Profiles', 'User biometric parameters, TDEE, BMR, BMI & macro goals')
    .addTag('Webhooks', 'Clerk user lifecycle webhook receiver (Svix-verified)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'CalPal API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

