import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class UserTelegramInfo {
  @OneToOne(() => User, (u) => u.telegramInfo, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @PrimaryColumn()
  userId: string;

  @Column()
  telegramId: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  botStartDate: string;
}
