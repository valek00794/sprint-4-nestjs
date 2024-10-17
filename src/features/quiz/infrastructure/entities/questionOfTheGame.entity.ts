import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
export class QuestionOfTheGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Question, (question) => question.questionOfGames)
  @JoinColumn()
  question: Question;

  @Column({ type: 'int', nullable: false })
  index: number;

  @ManyToOne(() => Game, (game) => game.questions)
  game: Game;
}
