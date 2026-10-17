import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from '@modules/property/schemas/property.schema';
import { PropertyController } from '@modules/property/property.controller';
import { PropertyRepository } from '@modules/property/property.repository';
import { PropertyService } from '@modules/property/property.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
  ],
  controllers: [PropertyController],
  providers: [PropertyRepository, PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
