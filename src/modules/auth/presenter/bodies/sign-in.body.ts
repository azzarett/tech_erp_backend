import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SignInBody {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password: string;
}
