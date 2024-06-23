import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class UserEmailConfirmationInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  confirmationCode: string;

  @Column({ type: 'datetime', nullable: false })
  expirationDate: Date;

  @Column({ type: 'boolean', nullable: false })
  isConfirmed: boolean;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  login: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'datetime', nullable: false })
  createdAt: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  passwordHash: string;

  @OneToOne(() => UserEmailConfirmationInfo, { nullable: true, cascade: true })
  @JoinColumn()
  emailConfirmation: UserEmailConfirmationInfo | null;
}

@Entity()
export class UsersRecoveryPasssword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userId: string;

  @Column({ type: 'datetime', nullable: false })
  expirationDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: false })
  recoveryCode: string;
}
