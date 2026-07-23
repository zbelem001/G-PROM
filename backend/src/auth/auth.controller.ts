import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto, @Req() request: Request) {
    const ipaddress = request.ip ?? null;
    const useragent = request.headers['user-agent'] ?? null;
    return this.authService.login(loginDto, ipaddress, useragent);
  }
}
