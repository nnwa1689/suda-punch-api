// src/user/user.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { username: username, is_active: true },
      // 登入時必須明確 select password，因為 entity 設定了 select: false
      select: ['id', 'username', 'password', 'employee_id','is_active' ,'is_admin'], 
    });

    if (!user) {
      throw new NotFoundException('使用者不存在或未啟用');
    }
    return user;
  }

  // 供建立帳號使用
  async create(username: string, plainPassword: string, employeeId: string) {

    // 1. 檢查帳號是否已存在
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('該帳號名稱已被使用');
    }

    // 2. 檢查該員工是否已經有帳號 (維持 1:1 關係)
    const existingEmployeeAccount = await this.userRepository.findOne({ 
      where: { employee_id: employeeId } 
    });
    if (existingEmployeeAccount) {
      throw new ConflictException('該員工已經擁有帳號');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const user = this.userRepository.create({
      id: uuidv4(),
      username: username,
      password: hashedPassword,
      employee_id: employeeId,
    });
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      // 處理資料庫層級的錯誤 (例如外鍵約束失敗)
      throw new NotFoundException('建立帳號錯誤。');
    }
  }
}