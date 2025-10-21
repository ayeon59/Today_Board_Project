import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserDto } from './dto/auth-response.dto';

export const CurrentUserOptional = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserDto | null => {
    const request = ctx.switchToHttp().getRequest();
    return (request.user as AuthUserDto | null | undefined) ?? null;
  },
);
