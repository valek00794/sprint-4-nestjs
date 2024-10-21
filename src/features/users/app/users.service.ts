import { Injectable } from '@nestjs/common';

import { UsersRepository } from '../infrastructure/users/users.repository';
import { bcryptArapter } from 'src/infrastructure/adapters/bcrypt/bcrypt.adapter';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  async updateUserPassword(userId: string, password: string): Promise<boolean> {
    const passwordHash = await bcryptArapter.generateHash(password);
    return await this.usersRepository.updateUserPassword(userId, passwordHash);
  }

  async deleteUserById(id: string): Promise<boolean> {
    return await this.usersRepository.deleteUserById(id);
  }
}
