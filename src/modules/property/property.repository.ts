import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  Property,
  PropertyDocument,
} from '@modules/property/schemas/property.schema';

@Injectable()
export class PropertyRepository {
  constructor(@InjectModel(Property.name) private readonly propertyModel: Model<Property>) {}

  create(data: Partial<Property>): Promise<PropertyDocument> {
    return this.propertyModel.create(data);
  }

  async findAll(
    filter: FilterQuery<Property>,
    skip: number,
    limit: number,
  ): Promise<[PropertyDocument[], number]> {
    return Promise.all([
      this.propertyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.propertyModel.countDocuments(filter).exec(),
    ]);
  }

  findById(id: string): Promise<PropertyDocument | null> {
    return this.propertyModel.findById(id).exec();
  }

  update(id: string, data: Partial<Property>): Promise<PropertyDocument | null> {
    return this.propertyModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
  }

  delete(id: string): Promise<PropertyDocument | null> {
    return this.propertyModel.findByIdAndDelete(id).exec();
  }
}
