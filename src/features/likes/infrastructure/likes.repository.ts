import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { LikesParrentNames } from '../domain/likes.types';
import { LikesEntity } from './likes.entity';

@Injectable()
export class LikesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async updateLikeInfo(
    parrentId: number,
    parrentName: LikesParrentNames,
    authorId: number,
    status: string,
  ): Promise<number | null> {
    const query = `
      INSERT INTO  "${parrentName}" ("Status", "ParrentId", "AuthorId", "AddedAt")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("ParrentId", "AuthorId")
      DO UPDATE SET "Status" = $1, "AddedAt" = $4
      RETURNING "Id" as "id";
    `;

    const likes = await this.dataSource.query<LikesEntity[]>(query, [
      status,
      parrentId,
      authorId,
      new Date().toISOString(),
    ]);
    return likes.length !== 0 ? likes[0].id : null;
  }
  async deleteLikeInfo(
    parrentId: number,
    authorId: number,
    parrentName: LikesParrentNames,
  ): Promise<boolean> {
    const query = `
      DELETE FROM "${parrentName}"
      WHERE "ParrentId" = $1
      AND "AuthorId" = $2;
    `;
    const result = await this.dataSource.query(query, [parrentId, authorId]);
    return result[1] === 1 ? true : false;
  }
  async getLikeInfo(parrentId: number, authorId: number, parrentName: LikesParrentNames) {
    const query = `
      SELECT  l."Id" as "id",  l."Status" as "status", l."ParrentId" as "parrentId", l."AuthorId" as "authorId", l."AddedAt" as "addedAt",
        u."Login" as "authorLogin"
       FROM  "${parrentName}" l
       JOIN "users" u ON l."AuthorId" = u."Id"
       WHERE "ParrentId" = $1
       AND "AuthorId" = $2
     `;
    const likesInfo = await this.dataSource.query<LikesEntity[]>(query, [parrentId, authorId]);
    return likesInfo.length !== 0 ? likesInfo : null;
  }
}
