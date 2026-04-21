import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateLoginDto } from './dto/auth.login.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(createLoginDto: CreateLoginDto) {
    const findEmail = await this.db.prisma.user.findUnique({
      where: { email: createLoginDto.email },
    });

    if (!findEmail)
      throw new ConflictException('This email or password does not exist.');

    const comparePassword = await bcrypt.compare(
      createLoginDto.password,
      findEmail.password,
    );

    if (!comparePassword)
      throw new ConflictException('This email or password does not exist.');

    const access_token = await this.jwtService.signAsync({
      userId: findEmail.id,
    });

    return access_token;
  }
}
