import { Body, Controller, Delete, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';

import { SETTINGS, StatusCodes } from 'src/settings/settings';
import { CreateUserModel } from './models/input/users.input.models';
import { UsersService } from '../app/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { SearchQueryParametersType } from 'src/features/domain/query.types';

@Controller(SETTINGS.PATH.users)
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  async createUser(@Body() inputModel: CreateUserModel) {
    const createdPost = await this.usersService.createUser(inputModel);
    return this.usersQueryRepository.mapToOutput(createdPost);
  }

  @Get()
  async getUsers(@Query() query: SearchQueryParametersType) {
    return await this.usersQueryRepository.getUsers(query);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    const deleteResult = await this.usersService.deleteUser(id);
    if (deleteResult) {
      return res.sendStatus(StatusCodes.NO_CONTENT_204);
    }
    return res.sendStatus(StatusCodes.NOT_FOUND_404);
  }
}
