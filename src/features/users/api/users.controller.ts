import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { SETTINGS } from 'src/settings/settings';
import { CreateUserModel } from './models/input/users.input.models';
import { UsersService } from '../app/users.service';
import { UsersQueryRepository } from '../infrastructure/users/users.query-repository';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
import { Public } from '../domain/decorators/public.decorator';

@Public()
@UseGuards(AuthBasicGuard)
@Controller(SETTINGS.PATH.users)
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  async createUser(@Body() inputModel: CreateUserModel) {
    const createdUser = await this.usersService.createUser(inputModel);
    return this.usersQueryRepository.mapToOutput(createdUser);
  }

  @Get()
  async getUsers(@Query() query: SearchQueryParametersType) {
    return await this.usersQueryRepository.getUsers(query);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    const deleteResult = await this.usersService.deleteUserById(id);
    if (deleteResult) {
      return res.sendStatus(HttpStatus.NO_CONTENT);
    }
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }
}
