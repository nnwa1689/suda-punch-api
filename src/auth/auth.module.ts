// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
imports: [
    UserModule,
    PassportModule,
    // 使用 registerAsync 而非 register
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // 使用 configService 讀取，它會等待 .env 載入
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRES_IN') || '1d',
        },
      }),
    }),
  ],
  controllers:[AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}