import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SignUpBody {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password: string;
}
