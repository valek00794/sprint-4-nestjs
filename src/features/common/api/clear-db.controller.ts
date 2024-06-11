import { Controller, Delete, Res } from '@nestjs/common';
import { Response } from 'express';

import { SETTINGS } from 'src/settings/settings';
import { DbService } from '../app/db.service';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';

@Public()
@Controller(SETTINGS.PATH.clearDb)
export class ClearDbController {
  constructor(protected dbService: DbService) {}
  @Delete()
  async clearDb(@Res() res: Response) {
    await this.dbService.clearDb();
    res.sendStatus(204);
  }
}
