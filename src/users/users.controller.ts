import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegisterationDTO } from './dtos';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   *
   * @param data
   * @param res
   * @returns
   */
  @Post()
  async registerUser(@Body() data: UserRegisterationDTO, @Res() res: any) {
    let result = await this.usersService.registerUser(data);

    return res.status(HttpStatus.CREATED).json({
      message: 'User Registered Successfully',
      data: result,
    });
  }

  /**
   *
   * @param res
   * @returns
   */
  @Get()
  async listUsers(@Res() res: any) {
    let result = await this.usersService.listUsers();

    return res.status(HttpStatus.OK).json({
      message: 'User fetched Successfully',
      total: result.length,
      data: result,
    });
  }
}
