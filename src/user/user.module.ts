// src/user/user.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from '../database/entities/user.entity';
import { UserController } from './user.controller';

@Module({
  imports: [
    // 讓 TypeORM 知道這個模組會用到 User 實體
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
  // 必須導出 UserService，這樣 AuthModule 才能 inject 它
  exports: [UserService], 
})
export class UserModule {}