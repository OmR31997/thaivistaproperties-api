import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CreatePropertyInquiryDto, PropertyInquiryQueryDto, UpdatePropertyInquiryDto } from '@modules/property-inquiry/dto/property-inquiry.dto';
import { PropertyInquiryRepository } from '@modules/property-inquiry/property-inquiry.repository';

@Injectable()
export class PropertyInquiryService {
  constructor(private readonly repository: PropertyInquiryRepository) {}

  async create(dto: CreatePropertyInquiryDto) {
    return this.repository.create(dto);
  }

  async findAll(query: PropertyInquiryQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const filter: Record<string, unknown> = {};

    if (query.intent) filter.intent = query.intent;
    if (query.propertyType) filter.propertyType = query.propertyType;
    if (query.preferredArea) filter.preferredArea = query.preferredArea;
    if (query.status) filter.status = query.status;
    if (query.search) {
      const search = query.search.trim();
      filter.$or = [
        { 'contact.name': { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } },
        { 'contact.phoneWhatsApp': { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await this.repository.findAll(filter, (page - 1) * limit, limit);
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && total > 0,
      },
    };
  }

  async findOne(id: string) {
    this.validateId(id);
    const inquiry = await this.repository.findById(id);
    if (!inquiry) throw new NotFoundException('Property inquiry not found');
    return inquiry;
  }

  async update(id: string, dto: UpdatePropertyInquiryDto) {
    this.validateId(id);
    const inquiry = await this.repository.update(id, dto);
    if (!inquiry) throw new NotFoundException('Property inquiry not found');
    return inquiry;
  }

  async remove(id: string) {
    this.validateId(id);
    const inquiry = await this.repository.delete(id);
    if (!inquiry) throw new NotFoundException('Property inquiry not found');
    return {
      success: true,
      message: 'Property inquiry deleted successfully',
      data: null,
    };
  }

  private validateId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid property inquiry id');
    }
  }
}
