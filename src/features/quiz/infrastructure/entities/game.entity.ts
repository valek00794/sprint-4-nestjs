import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PlayerProgress } from './playerProgress.entity';
import { Question } from './question.entity';
import { GameStatuses } from '../../domain/quiz.types';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PlayerProgress, { cascade: true })
  @JoinColumn()
  firstPlayerProgress: PlayerProgress;

  @OneToOne(() => PlayerProgress, { cascade: true })
  @JoinColumn()
  secondPlayerProgress: PlayerProgress | null = null;

  @OneToMany(() => Question, (question) => question.game)
  questions: Question[] | null = null;

  @Column({ type: 'varchar', nullable: false, default: GameStatuses.PendingSecondPlayer })
  status: GameStatuses; //либо стринг

  @Column({ type: 'timestamp with time zone', nullable: false, default: () => 'NOW()' })
  pairCreatedDate: string;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  startGameDate: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  finishGameDate: string | null;
}
