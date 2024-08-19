import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: false, collation: 'C' })
  body: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt: string;

  @Column({ type: 'jsonb', nullable: false })
  correctAnswers: [string];

  @Column({ type: 'timestamp with time zone', nullable: false })
  updatedAt: string;

  @Column({ type: 'boolean', nullable: false })
  published: boolean;
}
