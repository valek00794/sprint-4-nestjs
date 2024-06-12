import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { stringToObjectId } from 'src/features/utils';
import { CheckUserByRefreshTokenCommand } from './checkUserByRefreshToken.useCase';
import { JWTTokensOutType } from 'src/infrastructure/adapters/jwt/jwt-types';

export class RenewTokensCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(RenewTokensCommand)
export class RenewTokensUseCase implements ICommandHandler<RenewTokensCommand> {
  constructor(
    private commandBus: CommandBus,
    protected jwtAdapter: JwtAdapter,
  ) {}
  async execute(command: RenewTokensCommand): Promise<JWTTokensOutType> {
    const userVerifyInfo = await this.commandBus.execute(
      new CheckUserByRefreshTokenCommand(command.refreshToken),
    );
    const tokens = await this.jwtAdapter.createJWTs(
      stringToObjectId(userVerifyInfo.userId),
      userVerifyInfo.deviceId,
    );
    return tokens;
  }
}
