import { Body, Controller, Post, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateLoginDto } from './dto/auth.login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @SetMetadata('isPublic', true)
  async login(@Body() createLoginDto: CreateLoginDto) {
    const access_token = await this.authService.login(createLoginDto);

    return { message: 'The system has been logged in.', access_token };
  }
}
