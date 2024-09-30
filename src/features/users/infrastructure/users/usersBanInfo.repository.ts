import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersBanStatuses } from './usersBanStatuses.entity';

@Injectable()
export class UsersBanInfoRepository {
  constructor(
    @InjectRepository(UsersBanStatuses)
    protected usersBanStatusesRepository: Repository<UsersBanStatuses>,
  ) {}

  async changeUserBanStatus(userId: number, banReason: string, isBanned: boolean) {
    let userBanInfo = await this.usersBanStatusesRepository.findOne({
      where: { userId },
    });
    if (userBanInfo) {
      userBanInfo.banReason = banReason;
      userBanInfo.isBanned = isBanned;
    } else {
      userBanInfo = this.usersBanStatusesRepository.create({
        userId,
        banReason,
        isBanned,
      });
    }
    return await this.usersBanStatusesRepository.save(userBanInfo);
  }
}
