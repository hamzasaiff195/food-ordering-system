import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: any,
  ) {
    let result = await this.authService.login(body.email, body.password);

    return res.status(HttpStatus.OK).json({
      message: 'Login Successful',
      access_token: result.access_token,
      user_data: result.userData,
    });
  }

  @Post('request-otp')
  async requestOtp(@Body() body: { email: string }, @Res() res: any) {
    let result = await this.authService.requestOtp(body.email);

    return res.status(HttpStatus.OK).json({
      message: result.message,
    });
  }

  @Post('login-otp')
  async loginWithOtp(
    @Body() body: { email: string; otp: string },
    @Res() res: any,
  ) {
    const result = await this.authService.loginWithOtp(body.email, body.otp);

    // Return JWT and user data
    return res.status(HttpStatus.OK).json({
      message: 'Login successful',
      access_token: result.access_token,
      user: result.userData,
    });
  }
}
