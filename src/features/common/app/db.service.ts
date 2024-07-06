import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DbService {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async clearDb() {
    const query = `
      DELETE FROM "users";
      DELETE FROM "emailConfirmations";
      DELETE FROM "usersRecoveryPassword";
      DELETE FROM "usersDevices";
      DELETE FROM "blogs";
      DELETE FROM "posts";
      DELETE FROM "comments";
      DELETE FROM "commentsLikes";
      DELETE FROM "postsLikes";
    `;
    await this.dataSource.query(query);
    return true;
  }
}
