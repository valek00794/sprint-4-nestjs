import bcrypt from 'bcrypt';

export const bcryptArapter = {
  async generateHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, passwordSalt);
  },
  async checkPassword(password: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  },
};
