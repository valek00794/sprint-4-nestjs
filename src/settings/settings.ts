import { config } from 'dotenv';
config();

export const SETTINGS = {
  PORT: process.env.PORT || 3000,
  PATH: {
    videos: '/videos',
    posts: '/posts',
    blogs: '/blogs',
    blogsSa: '/sa/blogs',
    users: '/users',
    usersSa: '/sa/users',
    auth: '/auth',
    devices: '/security/devices',
    comments: '/comments',
    quizSa: '/sa/quiz/questions',
    quizPairGame: '/pair-game-quiz/pairs',
    clearDb: '/testing/all-data',
    clearLocalDb: '/testing/videos/all-data',
  },
  ADMIN_AUTH: 'admin:qwerty',
  DB: {
    mongoURI: process.env.MONGO_URL || '',
  },
  JWT: {
    AT_SECRET: process.env.AT_SECRET || '',
    RT_SECRET: process.env.RT_SECRET || '',
    AT_EXPIRES_TIME: process.env.AT_EXPIRES_TIME || '10s',
    RT_EXPIRES_TIME: process.env.RT_EXPIRES_TIME || '20s',
  },
};

export enum ResultStatus {
  Success = 'Success',
  Created = 'Created',
  NoContent = 'NoContent',

  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  NotFound = 'NotFound',
  Forbidden = 'Forbidden',
  TooManyRequests = 'TooManyRequests',
}
