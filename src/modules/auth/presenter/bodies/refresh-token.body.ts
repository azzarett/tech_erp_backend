import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenBody {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
