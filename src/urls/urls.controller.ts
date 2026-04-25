import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Redirect } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UrlsService } from './urls.service';

@ApiTags('urls')
@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @ApiOperation({ summary: 'Create a short URL from a long URL' })
  @ApiBody({ type: CreateShortUrlDto })
  @ApiResponse({
    status: 201,
    description: 'Short URL created successfully',
    schema: {
      example: {
        id: 1,
        originalUrl: 'https://nestjs.com',
        shortCode: 'Ab12xY',
        shortUrl: 'http://localhost:3000/Ab12xY',
        createdAt: '2026-04-25T09:22:10.438Z',
      },
    },
  })
  @Post('shorten')
  createShortUrl(@Body() createShortUrlDto: CreateShortUrlDto) {
    return this.urlsService.createShortUrl(createShortUrlDto);
  }

  @ApiOperation({ summary: 'Get all generated short links' })
  @ApiOkResponse({ description: 'Returns all links' })
  @Get('links')
  getAllLinks() {
    return this.urlsService.getAllLinks();
  }

  @ApiOperation({ summary: 'Redirect short code to original URL' })
  @ApiParam({
    name: 'code',
    description: 'The generated short code',
    example: 'Ab12xY',
  })
  @ApiResponse({ status: 302, description: 'Redirects to original URL' })
  @ApiNotFoundResponse({ description: 'Short code not found' })
  @Get(':code')
  @Redirect()
  async redirectToOriginalUrl(@Param('code') code: string) {
    const originalUrl = await this.urlsService.getOriginalUrlByShortCode(code);
    return { url: originalUrl };
  }

  @ApiOperation({ summary: 'Delete a link by id' })
  @ApiParam({
    name: 'id',
    description: 'Link ID',
    example: 1,
  })
  @ApiNotFoundResponse({ description: 'Link id not found' })
  @Delete(':id')
  deleteLinkById(@Param('id', ParseIntPipe) id: number) {
    return this.urlsService.deleteLinkById(id);
  }

  @ApiOperation({ summary: 'Update original URL by id' })
  @ApiParam({
    name: 'id',
    description: 'Link ID',
    example: 1,
  })
  @ApiBody({ type: UpdateUrlDto })
  @ApiConflictResponse({ description: 'URL already exists on another link' })
  @ApiNotFoundResponse({ description: 'Link id not found' })
  @Patch(':id')
  updateLinkById(@Param('id', ParseIntPipe) id: number, @Body() updateUrlDto: UpdateUrlDto) {
    return this.urlsService.updateLinkById(id, updateUrlDto);
  }
}
