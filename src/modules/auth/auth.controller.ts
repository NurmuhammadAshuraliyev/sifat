import { Body, Controller, Post, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateLoginDto } from './dto/auth.login.dto';

// 👉 Swagger import
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    type: CreateLoginDto,
    description: 'Login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        message: 'The system has been logged in.',
        access_token: 'jwt_token_here',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async login(@Body() createLoginDto: CreateLoginDto) {
    const access_token = await this.authService.login(createLoginDto);

    return { message: 'The system has been logged in.', access_token };
  }
}
