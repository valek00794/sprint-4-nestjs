import { Injectable } from '@nestjs/common';

import { LikesInfo } from '../domain/likes.types';
import { Like, LikeDocument } from './likes.schema';

@Injectable()
export class LikesRepository {
  // constructor(@InjectModel(Like.name) private LikeStatusModel: Model<LikeDocument>) {}
  // async updateLikeInfo(
  //   parrentId: string,
  //   authorId: string,
  //   authorLogin: string,
  //   status: string,
  // ): Promise<LikesInfo | null> {
  //   return await this.LikeStatusModel.findOneAndUpdate(
  //     { parrentId, authorId, authorLogin },
  //     {
  //       status,
  //       addedAt: new Date().toISOString(),
  //     },
  //     { new: true, upsert: true },
  //   );
  // }
  // async deleteLikeInfo(parrentId: string, authorId: string): Promise<LikesInfo | null> {
  //   return await this.LikeStatusModel.findOneAndDelete({ parrentId, authorId });
  // }
  // async getLikeInfo(parrentId: string, authorId: string) {
  //   return await this.LikeStatusModel.findOne({ parrentId, authorId });
  // }
}
