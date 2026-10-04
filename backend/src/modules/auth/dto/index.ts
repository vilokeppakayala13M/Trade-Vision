import { IsEmail, IsString, MinLength, MaxLength, Matches, IsBoolean, Equals, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SAFE_PATTERNS } from '../../../common/utils/safe-regex.util';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @MaxLength(254)
  @IsEmail()
  email: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  @Matches(SAFE_PATTERNS.PHONE, { message: 'Invalid Indian phone number' })
  phone?: string;

  @ApiProperty({ example: 'Password@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @MaxLength(254)
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @MaxLength(254)
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'randomtoken123', minLength: 64 })
  @IsString()
  @MinLength(64)
  @MaxLength(128)
  token: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @MaxLength(254)
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'NewPassword@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
}

export class DeleteAccountDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @Equals(true)
  confirm: boolean;
}
