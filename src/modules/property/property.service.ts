import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CacheService } from '@shared/cache/cache.service';
import {
  CreatePropertyDto,
  PropertyQueryDto,
  UpdatePropertyDto,
} from '@modules/property/dto/property.dto';
import { PropertyRepository } from '@modules/property/property.repository';

@Injectable()
export class PropertyService {
  constructor(
    private readonly repository: PropertyRepository,
    private readonly cacheService: CacheService,
  ) {}

  async create(dto: CreatePropertyDto) {
    const property = await this.repository.create(dto);
    await this.cacheService.clear();
    return property;
  }

  async findAll(query: PropertyQueryDto) {
    const filter: Record<string, unknown> = {};
    if (query.intent) filter.intent = query.intent;
    if (query.propertyType) filter.propertyType = query.propertyType;
    if (query.bedrooms) filter.bedrooms = query.bedrooms;
    if (query.bathrooms) filter.bathrooms = query.bathrooms;
    if (query.status) filter.status = query.status;
    if (query.search?.trim()) {
      const search = query.search.trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { buildingName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const cacheKey = `property:list:${JSON.stringify(query)}`;
    return this.cacheService.getOrSet(cacheKey, async () => {
      const [data, total] = await this.repository.findAll(
        filter,
        (query.page - 1) * query.limit,
        query.limit,
      );
      const totalPages = Math.ceil(total / query.limit);
      return {
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
          hasNextPage: query.page < totalPages,
          hasPreviousPage: query.page > 1 && total > 0,
        },
      };
    });
  }

  async findOne(id: string) {
    this.validateId(id);
    return this.cacheService.getOrSet(`property:item:${id}`, async () => {
      const property = await this.repository.findById(id);
      if (!property) throw new NotFoundException('Property not found');
      return property;
    });
  }

  async update(id: string, dto: UpdatePropertyDto) {
    this.validateId(id);
    const property = await this.repository.update(id, dto);
    if (!property) throw new NotFoundException('Property not found');
    await this.cacheService.clear();
    return property;
  }

  async remove(id: string) {
    this.validateId(id);
    const property = await this.repository.delete(id);
    if (!property) throw new NotFoundException('Property not found');
    await this.cacheService.clear();
    return { success: true, message: 'Property deleted successfully', data: null };
  }

  private validateId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid property id');
    }
  }
}
