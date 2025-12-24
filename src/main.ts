import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  const config = new DocumentBuilder()
  .setTitle('Suda 速打打卡系統 API')
  .setVersion('1.0')
  .addBearerAuth() // 讓文件支援 JWT 測試
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 必須加入這行，裝飾器才會生效！
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // 自動過濾掉非 DTO 定義的欄位
    forbidNonWhitelisted: true, // 如果傳入非定義欄位，直接噴錯
    transform: true,         // 自動將型別轉為 DTO 類別
  }));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
