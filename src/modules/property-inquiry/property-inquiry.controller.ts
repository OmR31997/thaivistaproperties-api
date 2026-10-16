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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationInterceptor } from '@common/interceptors/pagination.interceptor';
import {
  CreatePropertyInquiryDto,
  PropertyInquiryQueryDto,
  UpdatePropertyInquiryDto,
} from '@modules/property-inquiry/dto/property-inquiry.dto';
import { PropertyInquiryService } from '@modules/property-inquiry/property-inquiry.service';

@ApiTags('property-inquiries')
@Controller('property-inquiries')
export class PropertyInquiryController {
  constructor(private readonly service: PropertyInquiryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a property inquiry' })
  @ApiResponse({ status: 201, description: 'Property inquiry created' })
  create(@Body() dto: CreatePropertyInquiryDto) {
    return this.service.create(dto).then((data) => ({
      success: true,
      message: 'Property inquiry created successfully',
      data,
    }));
  }

  @Get()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List property inquiries with search and filters' })
  @ApiResponse({ status: 200, description: 'Paginated property inquiries' })
  findAll(@Query() query: PropertyInquiryQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property inquiry' })
  @ApiResponse({ status: 200, description: 'Property inquiry details' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id).then((data) => ({
      success: true,
      message: 'Success',
      data,
    }));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property inquiry' })
  @ApiResponse({ status: 200, description: 'Property inquiry updated' })
  update(@Param('id') id: string, @Body() dto: UpdatePropertyInquiryDto) {
    return this.service.update(id, dto).then((data) => ({
      success: true,
      message: 'Property inquiry updated successfully',
      data,
    }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property inquiry' })
  @ApiResponse({ status: 200, description: 'Property inquiry deleted' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
