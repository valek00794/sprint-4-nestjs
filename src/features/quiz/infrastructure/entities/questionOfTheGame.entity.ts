import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
export class QuestionOfTheGame {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Question)
  @JoinColumn()
  question: Question;

  @ManyToOne(() => Game, (game) => game.questions)
  game: Game;
}
