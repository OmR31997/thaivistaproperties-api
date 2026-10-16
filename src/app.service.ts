import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  getHealth() {
    return {
      success: true,
      message: 'API Health is OK',
      data: { status: 'ok' },
    };
  }
}
