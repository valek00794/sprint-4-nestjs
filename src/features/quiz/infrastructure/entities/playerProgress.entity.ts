import { Column, Entity, JoinColumn, OneToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from 'src/features/users/infrastructure/users/users.entity';
import { Answer } from './answer.entity';

@Entity()
export class PlayerProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  score: number;

  @ManyToOne(() => User)
  @JoinColumn()
  player: User;

  @OneToMany(() => Answer, (answers) => answers.progress)
  @JoinColumn()
  answers: Answer[];
}