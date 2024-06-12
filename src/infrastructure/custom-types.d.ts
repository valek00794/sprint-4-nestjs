import { UserInfo } from '../features/users/domain/users.types';

declare global {
  namespace Express {
    export interface Request {
      user?: UserInfo;
    }
  }
}
