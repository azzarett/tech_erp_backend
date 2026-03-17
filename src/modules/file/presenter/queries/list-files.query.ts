import { IsInt, IsOptional, Min } from 'class-validator';

export class ListFilesQuery {
  @IsOptional()
  @IsInt()
  @Min(1)
  list_size?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;
}
