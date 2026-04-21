import {
  BadRequestException,
  CanActivate,
  ConflictException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly db: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const functionHandler = context.getHandler();
    const classHandler = context.getClass();

    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      functionHandler,
      classHandler,
    ]);

    if (isPublic) return true;

    try {
      const token = request.headers.authorization.split(' ')[1];

      const { userId } = await this.jwtService.verifyAsync(token);

      const user = await this.db.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) throw new ConflictException('Token topilmadi.');

      request.userId = userId;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token topilmadi.');
    }
  }
}
