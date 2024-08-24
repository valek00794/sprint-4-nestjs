import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuestionOfTheGame } from './questionOfTheGame.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: false, collation: 'C' })
  body: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt: string;

  @Column({ type: 'jsonb', nullable: false })
  correctAnswers: string[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  updatedAt: string | null;

  @Column({ type: 'boolean', nullable: false })
  published: boolean;

  @OneToMany(() => QuestionOfTheGame, (questionOfTheGame) => questionOfTheGame.question)
  questionOfGames: QuestionOfTheGame[];
}
