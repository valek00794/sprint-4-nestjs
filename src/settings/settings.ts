import { config } from 'dotenv';
config();

export const SETTINGS = {
  PORT: process.env.PORT || 3000,
  PATH: {
    videos: '/videos',
    posts: '/posts',
    blogs: '/blogs',
    blogsBlogger: '/blogger/blogs',
    blogsSa: '/sa/blogs',
    users: '/users',
    usersSa: '/sa/users',
    usersBlogger: '/blogger/users',
    auth: '/auth',
    devices: '/security/devices',
    comments: '/comments',
    quizQuestionsSa: '/sa/quiz/questions',
    quizGame: '/pair-game-quiz',
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
  S3: {
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '',
    S3_SECRET_KEY: process.env.S3_SECRET_KEY || '',
    S3_CONNECTION_STRING: process.env.S3_CONNECTION_STRING || '',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || '',
    S3_PUBLIC_URL: process.env.S3_PUBLIC_URL || '',
    S3_REGION: process.env.S3_REGION || '',
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
