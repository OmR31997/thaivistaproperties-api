import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '@common/dto/base-query.dto';

export class UploadListQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Cloudinary folder prefix relative to the root folder' })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional({ description: 'Cursor returned by the previous list request' })
  @IsOptional()
  @IsString()
  cursor?: string;
}

export class DeleteUploadsDto {
  @ApiPropertyOptional({ type: [String], description: 'Cloudinary public IDs to delete' })
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}
