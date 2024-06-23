import { Injectable, NotFoundException } from '@nestjs/common';

import { UsersRepository } from '../infrastructure/users/users.repository';
import { bcryptArapter } from 'src/infrastructure/adapters/bcrypt/bcrypt.adapter';
import { isValidMongoId } from 'src/features/utils';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  // async updateUserPassword(userId: string, password: string): Promise<boolean> {
  //   if (!isValidMongoId(userId)) {
  //     throw new NotFoundException('User not found');
  //   }
  //   const passwordHash = await bcryptArapter.generateHash(password);
  //   return await this.usersRepository.updateUserPassword(userId, passwordHash);
  // }

  // async deleteUserById(id: string): Promise<boolean> {
  //   if (!isValidMongoId(id)) {
  //     throw new NotFoundException('User not found');
  //   }
  //   return await this.usersRepository.deleteUserById(id);
  // }
}
