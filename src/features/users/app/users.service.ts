import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../infrastructure/Users.schema';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserModel } from '../api/models/input/users.input.models';
import { bcryptArapter } from 'src/infrastructure/guards/bcrypt.adapter';

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createUser(inputModel: CreateUserModel) {
    const passwordHash = await bcryptArapter.generateHash(inputModel.password);

    const signUpData = new this.userModel({
      login: inputModel.login,
      email: inputModel.email,
      passwordHash,
      createdAt: new Date().toISOString(),
    });
    return await this.usersRepository.createUser(signUpData);
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user id');
    }
    return await this.usersRepository.deleteUserById(id);
  }
}
