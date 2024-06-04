import { IsNotEmpty, MaxLength } from 'class-validator';
import { IsBlogIdExist } from 'src/infrastructure/pipes/blogId.validation.pipe';

const VALIDATE_PHARAMS = {
  titleMaxLength: 30,
  shortDescriptionMaxLength: 100,
  contentMaxLength: 1000,
};

export class CreatePostModel {
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.titleMaxLength)
  title: string;
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.shortDescriptionMaxLength)
  shortDescription: string;
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.contentMaxLength)
  content: string;
  @IsBlogIdExist({
    message: 'BlogId not found',
  })
  blogId: string;
}
