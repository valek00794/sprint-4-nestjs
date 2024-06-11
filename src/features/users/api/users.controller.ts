import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';

import { SETTINGS } from 'src/settings/settings';
import { CreateUserModel } from './models/input/users.input.models';
import { UsersService } from '../app/users.service';
import { UsersQueryRepository } from '../infrastructure/users/users.query-repository';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
import { Public } from '../../../infrastructure/decorators/transform/public.decorator';

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
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    const deleteResult = await this.usersService.deleteUserById(id);
    if (!deleteResult) {
      throw new NotFoundException('User not found');
    }
  }
}
