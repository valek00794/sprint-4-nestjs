import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEmailConfirmationInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  confirmationCode: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  expirationDate: Date;

  @Column({ type: 'boolean', nullable: false })
  isConfirmed: boolean;

  @Column({ type: 'varchar', nullable: false })
  userId: string;
}
