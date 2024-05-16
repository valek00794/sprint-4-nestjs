import { Controller, Delete, Res } from '@nestjs/common';
import { Response } from 'express';

import { SETTINGS } from 'src/settings';
import { DbService } from './db.service';

@Controller(SETTINGS.PATH.clearDb)
export class ClearDbController {
  constructor(protected dbService: DbService) {}
  @Delete()
  async clearDb(@Res() res: Response) {
    await this.dbService.clearDb();
    res.sendStatus(204);
  }
}
