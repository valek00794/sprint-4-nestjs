import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DeleteObjectCommand, ObjectCannedACL, PutObjectCommand } from '@aws-sdk/client-s3';

import { FileStorageService } from 'src/infrastructure/utils/file-storage.service';

@Injectable()
export class ImageStorageService {
  constructor(private readonly fileStorageService: FileStorageService) {}
  public async saveBlogImage(
    userId: string,
    blogId: string,
    image: Buffer,
    mimeType: string,
  ): Promise<{
    imageUrl: string;
    imageKey: string;
  }> {
    const s3Client = this.fileStorageService.getS3Client();
    const fileExtension = mimeType.split('/')[1];
    const uuid = uuidv4();
    const bucketName = this.fileStorageService.getBucketName();
    const params = {
      Bucket: bucketName,
      Key: `users/${userId}/blogs/${blogId}/${uuid}.${fileExtension}`,
      Body: image,
      ContentType: mimeType,
      ACL: ObjectCannedACL.public_read,
    };
    await s3Client.send(new PutObjectCommand(params));
    const imageUrl = this.getImageUrl(params.Key);
    const imageKey = params.Key;
    return { imageUrl, imageKey };
  }
  public async savePostImage(
    userId: string,
    posts: string,
    image: Buffer,
    mimeType: string,
  ): Promise<{
    imageUrl: string;
    imageKey: string;
  }> {
    const s3Client = this.fileStorageService.getS3Client();
    const fileExtension = mimeType.split('/')[1];
    const uuid = uuidv4();
    const bucketName = this.fileStorageService.getBucketName();
    const params = {
      Bucket: bucketName,
      Key: `users/${userId}/posts/${posts}/${uuid}.${fileExtension}`,
      Body: image,
      ContentType: mimeType,
      ACL: ObjectCannedACL.public_read,
    };
    await s3Client.send(new PutObjectCommand(params));
    const imageUrl = this.getImageUrl(params.Key);
    const imageKey = params.Key;
    return { imageUrl, imageKey };
  }

  public getImageUrl(imageKey: string): string {
    const publicUrl = this.fileStorageService.getPublicUrl();
    //const bucketName = this.fileStorageService.getBucketName();
    return `${publicUrl}/${imageKey}`;
  }

  public async deleteImageByKey(imageKey: string): Promise<void> {
    const s3Client = this.fileStorageService.getS3Client();
    const bucketName = this.fileStorageService.getBucketName();
    const params = {
      Bucket: bucketName,
      Key: imageKey,
    };
    await s3Client.send(new DeleteObjectCommand(params));
  }
}
