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
import { EmployeeModule } from './employee/employee.module';
import { EmployeeSchedule } from './database/entities/employee-schedule.entity';
import { ShiftTemplate } from './database/entities/shift-template.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './database/entities/user.entity';
import { Department } from './database/entities/department.entity';
import { PunchPointModule } from './punch-point/punch-point.module';

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
      extra: {
        timezone: process.env.TIME_ZONE || 'Asia/Taipei', 
      },
      entities: [
        PunchPoint,
        EmployeeDevice,
        PunchLog,
        Employee,
        EmployeeSchedule,
        ShiftTemplate,
        User,
        Department
        // ... 其他 Entity 
      ],
      synchronize: false, 
    }),
    CommonModule, PunchModule, EmployeeModule, UserModule, AuthModule, PunchPointModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
