import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateShortUrlDto {
  @ApiProperty({
    example: 'https://nestjs.com',
    description: 'Original long URL that should be shortened',
  })
  @IsNotEmpty()
  @IsUrl(
    {
      require_protocol: true,
    },
    { message: 'Please provide a valid URL with http/https' },
  )
  originalUrl: string;
}
