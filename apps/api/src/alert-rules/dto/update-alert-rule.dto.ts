import { IsBoolean, IsEmail, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateAlertRuleDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsInt()
  @Min(1)
  @Max(10)
  failureThreshold!: number;

  @IsBoolean()
  notifyOnRecovery!: boolean;
}

