import { Exclude, Expose } from 'class-transformer';

export class AuthUserDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  nickname!: string;

  @Expose()
  createdAt!: Date;

  @Exclude()
  password?: string;
}

export class AuthResponseDto {
  @Expose()
  accessToken!: string;

  @Expose()
  user!: AuthUserDto;
}
