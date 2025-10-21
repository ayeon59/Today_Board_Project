import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  private readonly rounds = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const hashed = await bcrypt.hash(dto.password, this.rounds);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        nickname: dto.nickname,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return this.buildAuthResponse(user);
  }

  async validateUser(userId: string): Promise<AuthUserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return this.toAuthUser(user);
  }

  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: User): AuthUserDto {
    const { password, ...rest } = user;
    return plainToInstance(AuthUserDto, rest, {
      excludeExtraneousValues: true,
    });
  }
}
