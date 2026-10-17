import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginationInterceptor } from '@common/interceptors/pagination.interceptor';
import {
  CreatePropertyDto,
  PaginatedPropertyResponseDto,
  PropertyQueryDto,
  UpdatePropertyDto,
} from '@modules/property/dto/property.dto';
import { PropertyService } from '@modules/property/property.service';

@ApiTags('properties')
@ApiExtraModels(PaginatedPropertyResponseDto)
@Controller('properties')
export class PropertyController {
  constructor(private readonly service: PropertyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a property' })
  @ApiResponse({ status: 201, description: 'Property created' })
  create(@Body() dto: CreatePropertyDto) {
    return this.service.create(dto).then((data) => ({
      success: true,
      message: 'Property created successfully',
      data,
    }));
  }

  @Get()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List properties with search and filters' })
  @ApiResponse({
    status: 200,
    description: 'Paginated properties',
    schema: { $ref: getSchemaPath(PaginatedPropertyResponseDto) },
  })
  findAll(@Query() query: PropertyQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property' })
  @ApiResponse({ status: 200, description: 'Property details' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id).then((data) => ({
      success: true,
      message: 'Success',
      data,
    }));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  @ApiResponse({ status: 200, description: 'Property updated' })
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.service.update(id, dto).then((data) => ({
      success: true,
      message: 'Property updated successfully',
      data,
    }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property' })
  @ApiResponse({ status: 200, description: 'Property deleted' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
