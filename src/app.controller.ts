import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from '@app/app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(['', 'health', 'health/live', 'health/ready'])
  @ApiOperation({ summary: 'Get API status' })
  getHealth() {
    return this.appService.getHealth();
  }
}
