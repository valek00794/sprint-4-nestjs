import { Column, Entity, JoinColumn, OneToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from 'src/features/users/infrastructure/users/user.entity';
import { Answer } from './answer.entity';
import { GameResultStatuses } from '../../domain/quiz.types';

@Entity()
export class PlayerProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  score: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  result: GameResultStatuses | null;

  @ManyToOne(() => User)
  @JoinColumn()
  player: User;

  @OneToMany(() => Answer, (answers) => answers.progress)
  @JoinColumn()
  answers: Answer[];
}
