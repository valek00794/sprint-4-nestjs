import { Module } from '@nestjs/common';
import { ClearDbController } from './api/clear-db.controller';
import { DbService } from './app/db.service';

@Module({
  imports: [],
  controllers: [ClearDbController],
  providers: [DbService],
})
export class TestingModule {}
