import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users, UsersService } from 'src/users';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly users: Repository<Users>,

    private readonly jwtService: JwtService,

    private readonly configService: ConfigService,

    private readonly usersService: UsersService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokensAndUpdate(user);
  }

  public async generateTokensAndUpdate(
    user: any,
  ): Promise<{ userData: any; access_token: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtExpiration = this.configService.get<string>('JWT_EXPIRES_IN');

    const access_token = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtExpiration as any,
    });

    const userData = {
      ...user,
      password: undefined,
      is_deleted: undefined,
    };

    return { userData, access_token };
  }

  async requestOtp(email: string) {
    const otp = await this.usersService.generateOtp(email);
    console.log('OTP: ', otp);
    await this.usersService.sendOtpEmail(email, otp);
    return { message: 'OTP sent to your email' };
  }

  async loginWithOtp(email: string, otp: string) {
    const user = await this.users.findOne({ where: { email } });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Check OTP and expiry
    if (
      user.otp !== otp ||
      !user.otp_expires_at ||
      user.otp_expires_at < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Clear OTP after successful login
    user.otp = null;
    user.otp_expires_at = null;
    await this.users.save(user);

    return this.generateTokensAndUpdate(user);
  }
}
