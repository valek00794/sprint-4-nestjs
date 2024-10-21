import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { SETTINGS } from 'src/settings/settings';

@Injectable()
export class FileStorageService {
  private s3Client: S3Client;
  private s3PublicUrl: string;
  private s3BucketName: string;
  constructor() {
    this.s3PublicUrl = SETTINGS.S3.S3_PUBLIC_URL;
    this.s3BucketName = SETTINGS.S3.S3_BUCKET_NAME;
    this.s3Client = new S3Client({
      endpoint: SETTINGS.S3.S3_CONNECTION_STRING,
      region: SETTINGS.S3.S3_REGION,
      credentials: {
        accessKeyId: SETTINGS.S3.S3_ACCESS_KEY,
        secretAccessKey: SETTINGS.S3.S3_SECRET_KEY,
      },
      forcePathStyle: true,
    });
  }
  getS3Client(): S3Client {
    return this.s3Client;
  }
  getBucketName(): string {
    return this.s3BucketName;
  }
  getPublicUrl(): string {
    return `${this.s3PublicUrl}`;
  }
}
