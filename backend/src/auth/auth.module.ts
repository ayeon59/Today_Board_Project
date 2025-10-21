// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SignOptions } from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtOptionalAuthGuard } from './jwt-optional-auth.guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => {
        const expiresIn = cs.get<string>('JWT_EXPIRES_IN');
        return {
          secret: cs.get<string>('JWT_SECRET', 'dev-secret'),
          signOptions: {
            expiresIn: (expiresIn ?? '7d') as SignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, JwtOptionalAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtOptionalAuthGuard, JwtModule],
})
export class AuthModule {}
