import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:9431',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('长者出行计划 API')
    .setDescription('长者出行规划后端服务接口文档')
    .setVersion('1.0.0')
    .addTag('plans', '出行计划管理')
    .addTag('preferences', '节奏偏好管理')
    .addTag('routes', '路线协商管理')
    .addTag('changes', '途中变更管理')
    .addTag('statistics', '数据统计')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(9432);
  console.log('Application is running on: http://localhost:9432');
  console.log('Swagger API docs: http://localhost:9432/api');
}
bootstrap();
