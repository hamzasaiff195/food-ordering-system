import { ConflictException, Injectable } from '@nestjs/common';
import { Users } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRegisterationDTO } from './dtos';
import * as bcrypt from 'bcrypt';
import { createTransporter } from '../config/email.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransporter(this.configService);
  }

  @InjectRepository(Users) private readonly users: Repository<Users>;

  /**
   *
   * @param dto
   * @returns
   */
  async registerUser(dto: UserRegisterationDTO) {
    const existingUser = await this.users.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.users.create({
      ...dto,
      password: hashedPassword,
    });

    await this.users.save(user);

    // to remove password from response
    delete user.password;

    return user;
  }

  /**
   *
   * @returns
   */
  async listUsers() {
    return await this.users.find();
  }

  async generateOtp(email: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new Error('User not found');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    user.otp = otp;
    user.otp_expires_at = otpExpiresAt;

    await this.users.save(user);

    return otp;
  }

  async sendOtpEmail(email: string, otp: string) {
    return this.transporter.sendMail({
      from: `"MyApp" <${this.configService.get('EMAIL_USER')}>`,
      to: email,
      subject: 'Your OTP for Login',
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    });
  }
}
