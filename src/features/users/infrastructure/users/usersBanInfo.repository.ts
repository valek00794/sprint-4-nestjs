import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersBanInfo } from './usersBanStatuses.entity';
import { User } from './users.entity';

@Injectable()
export class UsersBanInfoRepository {
  constructor(
    @InjectRepository(UsersBanInfo)
    protected usersBanStatusesRepository: Repository<UsersBanInfo>,
    @InjectRepository(User) protected usersRepository: Repository<User>,
  ) {}

  async banUser(userId: number, banReason: string, banDate: string) {
    let userBanInfo = await this.usersBanStatusesRepository.findOne({
      where: { userId },
    });
    if (userBanInfo) {
      userBanInfo.banReason = banReason;
      userBanInfo.isBanned = true;
      userBanInfo.banDate = banDate;
    } else {
      userBanInfo = this.usersBanStatusesRepository.create({
        userId,
        banReason,
        isBanned: true,
        banDate,
      });
    }
    return await this.usersBanStatusesRepository.save(userBanInfo);
  }

  async unBanUser(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (user) {
      user.banInfo = null;
      await this.usersRepository.save(user);
    }
    return await this.usersBanStatusesRepository.delete({ userId });
  }
}
