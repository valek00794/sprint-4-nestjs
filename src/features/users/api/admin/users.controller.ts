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
  Put,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { CreateUserCommand } from '../../app/useCases/users/createUser.useCase';
import { UsersService } from '../../app/users.service';
import { UsersQueryRepository } from '../../infrastructure/users/users.query-repository';
import {
  ChangeUserBanStatusInputModel,
  CreateUserInputModel,
} from '../models/input/users.input.models';
import { ChangeUserBanStatusCommand } from '../../app/useCases/users/changeUserBanStatus.useCase';

@Public()
@UseGuards(AuthBasicGuard)
@Controller(SETTINGS.PATH.usersSa)
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post()
  async createUser(@Body() inputModel: CreateUserInputModel) {
    const createdUser = await this.commandBus.execute(new CreateUserCommand(inputModel));
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

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeUserBanStatus(
    @Param('id') id: string,
    @Body() inputModel: ChangeUserBanStatusInputModel,
  ) {
    await this.commandBus.execute(new ChangeUserBanStatusCommand(id, inputModel));
  }
}
