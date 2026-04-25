import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @ApiPropertyOptional({
    example: 'https://docs.nestjs.com',
    description: 'New original URL for an existing short link',
  })
  @IsOptional()
  @IsUrl(
    {
      require_protocol: true,
    },
    { message: 'Please provide a valid URL with http/https' },
  )
  originalUrl?: string;
}
