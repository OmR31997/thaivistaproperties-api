import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  PropertyInquiry,
  PropertyInquiryDocument,
} from '@modules/property-inquiry/schemas/property-inquiry.schema';

@Injectable()
export class PropertyInquiryRepository {
  constructor(
    @InjectModel(PropertyInquiry.name)
    private readonly propertyInquiryModel: Model<PropertyInquiry>,
  ) {}

  async create(data: Partial<PropertyInquiry>): Promise<PropertyInquiryDocument> {
    return this.propertyInquiryModel.create(data);
  }

  async findAll(
    filter: FilterQuery<PropertyInquiry>,
    skip: number,
    limit: number,
  ): Promise<[PropertyInquiryDocument[], number]> {
    return Promise.all([
      this.propertyInquiryModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyInquiryModel.countDocuments(filter).exec(),
    ]);
  }

  async findById(id: string): Promise<PropertyInquiryDocument | null> {
    return this.propertyInquiryModel.findById(id).exec();
  }

  async update(
    id: string,
    data: Partial<PropertyInquiry>,
  ): Promise<PropertyInquiryDocument | null> {
    return this.propertyInquiryModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
  }

  async delete(id: string): Promise<PropertyInquiryDocument | null> {
    return this.propertyInquiryModel.findByIdAndDelete(id).exec();
  }
}
