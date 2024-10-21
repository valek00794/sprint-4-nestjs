import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PlayerProgress } from './playerProgress.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  questionId: string;

  @Column()
  answerStatus: string;

  @Column({ type: 'timestamp with time zone', nullable: false, default: () => 'NOW()' })
  addedAt: string;

  @ManyToOne(() => PlayerProgress, (progress) => progress.answers)
  progress: PlayerProgress;
}
