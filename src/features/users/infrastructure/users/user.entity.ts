import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserEmailConfirmationInfo } from './usersEmailConfirmationInfo.entity';
import { Comment } from '../../../comments/infrastructure/comments.entity';
import { Like } from 'src/features/likes/infrastructure/likes.entity';
import { UsersBanInfo } from '../banInfo/usersBanInfo.entity';
import { UserTelegramInfo } from '../integratons/userTelegramInfo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ collation: 'C' })
  login: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  passwordHash: string;

  @OneToOne(() => UserEmailConfirmationInfo, (ec) => ec.userId)
  @JoinColumn()
  emailConfirmation: UserEmailConfirmationInfo | null;

  @OneToMany(() => Comment, (comment) => comment.commenator)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.author)
  likes: Like[];

  @OneToOne(() => UsersBanInfo, (bi) => bi.userId)
  @JoinColumn()
  banInfo: UsersBanInfo | null;

  @OneToOne(() => UserTelegramInfo, (ut) => ut.userId)
  @JoinColumn()
  telegramInfo: UserTelegramInfo | null;
}
