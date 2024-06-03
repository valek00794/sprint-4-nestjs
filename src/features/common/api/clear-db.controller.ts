import { Controller, Delete, Res } from '@nestjs/common';
import { Response } from 'express';

import { SETTINGS } from 'src/settings/settings';
import { DbService } from '../app/db.service';

@Controller(SETTINGS.PATH.clearDb)
export class ClearDbController {
  constructor(protected dbService: DbService) {}
  @Delete()
  async clearDb(@Res() res: Response) {
    await this.dbService.clearDb();
    res.sendStatus(204);
  }
}