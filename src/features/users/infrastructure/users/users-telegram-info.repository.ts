import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';
import { UserTelegramInfo } from '../integratons/userTelegramInfo.entity';

@Injectable()
export class UsersTelegramInfoRepository {
  constructor(
    @InjectRepository(User)
    protected usersRepository: Repository<User>,
    @InjectRepository(UserTelegramInfo)
    protected userTelegramInfoRepository: Repository<UserTelegramInfo>,
  ) {}

  async setUserTelegramInfo(userId: string, telegramUserId: number) {
    const userTelegramInfo = await this.userTelegramInfoRepository.save({
      userId,
      telegramId: telegramUserId,
    });

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (user) {
      user.telegramInfo = userTelegramInfo;
      await this.usersRepository.save(user);
      return true;
    } else {
      return false;
    }
  }

  async getUserTelegramInfo(userId: string) {
    return await this.userTelegramInfoRepository.findOne({ where: { userId } });
  }
}
