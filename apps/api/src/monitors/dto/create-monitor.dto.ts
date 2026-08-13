import { IsInt, IsNotEmpty, IsString, IsUrl, Min } from 'class-validator';

export class CreateMonitorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @IsInt()
  @Min(60)
  intervalSeconds!: number;
}
