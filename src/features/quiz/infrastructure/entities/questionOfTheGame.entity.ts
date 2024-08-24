import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
export class QuestionOfTheGame {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (question) => question.questionOfGames)
  @JoinColumn()
  question: Question;

  @ManyToOne(() => Game, (game) => game.questions)
  game: Game;
}
