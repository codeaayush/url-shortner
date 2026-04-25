import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { Url } from './entities/url.entity';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly configService: ConfigService,
  ) {}

  async createShortUrl(createShortUrlDto: CreateShortUrlDto) {
    const baseUrl = this.configService.get<string>('BASE_URL') ?? 'http://localhost:3000';
    const existingUrl = await this.urlRepository.findOneBy({
      originalUrl: createShortUrlDto.originalUrl,
    });

    if (existingUrl) {
      return this.mapToResponse(existingUrl, baseUrl);
    }

    const shortCode = await this.generateUniqueShortCode();
    const newUrl = this.urlRepository.create({
      originalUrl: createShortUrlDto.originalUrl,
      shortCode,
    });

    const savedUrl = await this.urlRepository.save(newUrl);

    return this.mapToResponse(savedUrl, baseUrl);
  }

  async getOriginalUrlByShortCode(code: string): Promise<string> {
    const existingUrl = await this.urlRepository.findOneBy({ shortCode: code });

    if (!existingUrl) {
      throw new NotFoundException(`No URL found for short code: ${code}`);
    }

    existingUrl.clickCount += 1;
    await this.urlRepository.save(existingUrl);

    return existingUrl.originalUrl;
  }

  async getAllLinks() {
    const baseUrl = this.configService.get<string>('BASE_URL') ?? 'http://localhost:3000';
    const links = await this.urlRepository.find({
      order: { id: 'DESC' },
    });

    return links.map((link) => this.mapToResponse(link, baseUrl));
  }

  async deleteLinkById(id: number) {
    const existingLink = await this.urlRepository.findOneBy({ id });
    if (!existingLink) {
      throw new NotFoundException(`No URL found for id: ${id}`);
    }

    await this.urlRepository.delete({ id });
    return { message: `Link with id ${id} deleted successfully` };
  }

  async updateLinkById(id: number, updateUrlDto: UpdateUrlDto) {
    const existingLink = await this.urlRepository.findOneBy({ id });
    if (!existingLink) {
      throw new NotFoundException(`No URL found for id: ${id}`);
    }

    if (!updateUrlDto.originalUrl) {
      return this.mapToResponse(existingLink);
    }

    const duplicateLink = await this.urlRepository.findOneBy({
      originalUrl: updateUrlDto.originalUrl,
    });
    if (duplicateLink && duplicateLink.id !== id) {
      throw new ConflictException('This URL already exists with another short code');
    }

    existingLink.originalUrl = updateUrlDto.originalUrl;
    const savedLink = await this.urlRepository.save(existingLink);
    return this.mapToResponse(savedLink);
  }

  private async generateUniqueShortCode(length = 6): Promise<string> {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    while (true) {
      const shortCode = Array.from({ length }, () => {
        const randomIndex = Math.floor(Math.random() * characters.length);
        return characters[randomIndex];
      }).join('');

      const existing = await this.urlRepository.findOneBy({ shortCode });
      if (!existing) {
        return shortCode;
      }
    }
  }

  private mapToResponse(link: Url, baseUrl?: string) {
    const resolvedBaseUrl = baseUrl ?? this.configService.get<string>('BASE_URL') ?? 'http://localhost:3000';
    return {
      id: link.id,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      shortUrl: `${resolvedBaseUrl}/${link.shortCode}`,
      clickCount: link.clickCount,
      createdAt: link.createdAt,
    };
  }
}
