import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger: Logger;

  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(SeederService.name);
  }

  async sendAll() {
    await this.sendUsers();
  }

  async sendUsers() {
    this.logger.log('Admin seedr started');

    const email = this.configService.get('SUPERADMIN_EMAIL') as string;
    const password = this.configService.get('SUPERADMIN_PASSWORD') as string;
    const name = this.configService.get('SUPERADMIN_NAME') as string;

    const findEmail = await this.db.prisma.user.findFirst({
      where: { email: email },
    });

    if (!findEmail) {
      const hashPassword = await bcrypt.hash(password, 12);

      await this.db.prisma.user.create({
        data: {
          email: email,
          password: hashPassword,
          fullName: name,
          phone: '+998 90 123 45 67',
        },
      });

      this.logger.log('Admin seedrs ended');
    }

    return true;
  }

  async onModuleInit() {
    try {
      await this.sendAll();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
