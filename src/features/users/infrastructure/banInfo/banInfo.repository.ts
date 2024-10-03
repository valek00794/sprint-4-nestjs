import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersBanInfo } from './usersBanInfo.entity';
import { User } from '../users/users.entity';
import { UsersBanInfoForBlogs } from './usersBanInfoForBlogs.entity';

@Injectable()
export class BanInfoRepository {
  constructor(
    @InjectRepository(UsersBanInfo)
    protected usersGlobalBanInfoRepository: Repository<UsersBanInfo>,
    @InjectRepository(UsersBanInfoForBlogs)
    protected usersBanInfoForBlogsRepository: Repository<UsersBanInfoForBlogs>,
    @InjectRepository(User) protected usersRepository: Repository<User>,
  ) {}

  async banUser(userId: number, banReason: string, banDate: string) {
    let userBanInfo = await this.usersGlobalBanInfoRepository.findOne({
      where: { userId },
    });
    if (userBanInfo) {
      userBanInfo.banReason = banReason;
      userBanInfo.isBanned = true;
      userBanInfo.banDate = banDate;
    } else {
      userBanInfo = this.usersGlobalBanInfoRepository.create({
        userId,
        banReason,
        isBanned: true,
        banDate,
      });
    }
    return await this.usersGlobalBanInfoRepository.save(userBanInfo);
  }

  async unBanUser(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (user) {
      user.banInfo = null;
      await this.usersRepository.save(user);
    }
    return await this.usersGlobalBanInfoRepository.delete({ userId });
  }

  async banUserForBlog(userId: number, blogId: number, banReason: string, banDate: string) {
    let userBanInfo = await this.usersBanInfoForBlogsRepository.findOne({
      where: { userId, blogId },
    });
    if (userBanInfo) {
      userBanInfo.banReason = banReason;
      userBanInfo.isBanned = true;
      userBanInfo.banDate = banDate;
    } else {
      userBanInfo = this.usersBanInfoForBlogsRepository.create({
        blogId,
        userId,
        banReason,
        isBanned: true,
        banDate,
      });
    }
    return await this.usersBanInfoForBlogsRepository.save(userBanInfo);
  }
  async unBanUserForBlog(userId: number, blogId: number) {
    return await this.usersBanInfoForBlogsRepository.delete({ userId, blogId });
  }

  async getBanInfoBlog(blogId: number, userId: number) {
    return await this.usersBanInfoForBlogsRepository.findOne({
      where: { userId, blogId },
    });
  }
}
