import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PlayerProgress } from './playerProgress.entity';
import { GameStatuses } from '../../domain/quiz.types';
import { QuestionOfTheGame } from './questionOfTheGame.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => PlayerProgress, { cascade: true })
  @JoinColumn()
  firstPlayerProgress: PlayerProgress;

  @OneToOne(() => PlayerProgress, { cascade: true })
  @JoinColumn()
  secondPlayerProgress: PlayerProgress | null = null;

  @OneToMany(() => QuestionOfTheGame, (questionOfTheGame) => questionOfTheGame.game)
  @JoinColumn()
  questions: QuestionOfTheGame[] | null;

  @Column({ type: 'varchar', nullable: false, default: GameStatuses.PendingSecondPlayer })
  status: GameStatuses;

  @Column({ type: 'timestamp with time zone', nullable: false, default: () => 'NOW()' })
  pairCreatedDate: string;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  startGameDate: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  finishGameDate: string | null;
}
