import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { PunchModule } from './punch/punch.module';
import { PunchPoint } from './database/entities/punch-point.entity'; 
import { EmployeeDevice } from './database/entities/employee-device.entity';
import { PunchLog } from './database/entities/punch-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Employee } from './database/entities/employee.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.' + process.env.NODE_ENV,
      isGlobal: true, // 讓配置可以在所有模組中使用
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'suda_user',
      password: process.env.DB_PASSWORD || 'your_strong_password',
      database: process.env.DB_DATABASE || 'suda_db',
      entities: [
        PunchPoint,
        EmployeeDevice,
        PunchLog,
        Employee
        // ... 其他 Entity 
      ],
      synchronize: false, 
    }),
    CommonModule, PunchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
