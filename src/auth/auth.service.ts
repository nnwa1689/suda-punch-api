// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, pass: string) {
    const user = await this.userService.findByUsername(username);
    
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    // Payload 包含身分識別資訊
    const payload = { 
      username: user.username, 
      sub: user.id, 
      employeeId: user.employee_id,
      isAdmin: user.is_admin
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}