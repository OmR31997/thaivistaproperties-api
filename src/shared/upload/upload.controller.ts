import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { UploadListQueryDto, DeleteUploadsDto } from '@shared/upload/dto/upload.dto';
import { UploadService } from '@shared/upload/upload.service';
import type { UploadInput, UploadedAsset } from '@shared/upload/upload.types';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('uploads')
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'album' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload one file to Cloudinary' })
  @ApiResponse({ status: 201, description: 'File uploaded' })
  async uploadOne(
    @UploadedFile() file?: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('A file is required');
    }
    const asset = await this.uploadService.uploadOne(this.toInput(file, folder));
    const data = this.withAccessUrl(asset);
    return { success: true, message: 'File uploaded successfully', data };
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @ApiOperation({ summary: 'Upload multiple files to Cloudinary' })
  @ApiResponse({ status: 201, description: 'Files uploaded' })
  async uploadBulk(
    @UploadedFiles() files?: Express.Multer.File[],
    @Body('folder') folder?: string,
  ) {
    if (!files?.length) {
      throw new BadRequestException('At least one file is required');
    }
    const assets = await this.uploadService.uploadBulk(
      files.map((file) => this.toInput(file, folder)),
    );
    const data = assets.map((asset) => this.withAccessUrl(asset));
    return { success: true, message: 'Files uploaded successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded resources with pagination metadata' })
  @ApiResponse({ status: 200, description: 'Uploaded resources' })
  async list(@Query() query: UploadListQueryDto) {
    const result = await this.uploadService.listResources({
      prefix: query.prefix,
      page: query.page,
      maxResults: query.limit,
    });
    return {
      success: true,
      message: 'Resources fetched successfully',
      data: result.resources.map((asset) => this.withAccessUrl(asset)),
      meta: result.meta,
    };
  }

  @Get('storage/usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Cloudinary storage and account usage' })
  @ApiResponse({ status: 200, description: 'Cloudinary usage and remaining quota' })
  async usage() {
    const data = await this.uploadService.getUsage();
    return {
      success: true,
      message: 'Storage usage fetched successfully',
      data,
    };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete multiple uploaded resources' })
  @ApiResponse({ status: 200, description: 'Resources deleted' })
  async deleteBulk(@Body() dto: DeleteUploadsDto) {
    if (!Array.isArray(dto.ids) || dto.ids.length === 0) {
      throw new BadRequestException('At least one resource ID is required');
    }
    await this.uploadService.deleteBulk(dto.ids);
    return { success: true, message: 'Resources deleted successfully', data: null };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete one uploaded resource' })
  @ApiParam({ name: 'id', description: 'Cloudinary public ID' })
  @ApiResponse({ status: 200, description: 'Resource deleted' })
  async deleteOne(@Param('id') id: string) {
    await this.uploadService.deleteOne(id);
    return { success: true, message: 'Resource deleted successfully', data: null };
  }

  private toInput(file: Express.Multer.File, folder?: string): UploadInput {
    return {
      buffer: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
      folder,
    };
  }

  private withAccessUrl(asset: UploadedAsset) {
    return {
      ...asset,
      url: this.uploadService.buildUrl(asset.relativePath, asset.format),
    };
  }
}
