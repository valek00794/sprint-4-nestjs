import { Controller, Delete, Res } from '@nestjs/common';
import { Response } from 'express';

import { SETTINGS } from 'src/settings';
import { DbService } from './db.service';

@Controller(SETTINGS.PATH.clearDb)
export class ClearDbController {
  constructor(protected bbService: DbService) {}
  @Delete()
  async clearDb(@Res() res: Response) {
    await this.bbService.clearDb();
    res.sendStatus(204);
  }
}
