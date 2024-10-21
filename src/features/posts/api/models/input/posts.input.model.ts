import { IsDefined, IsNotEmpty, MaxLength } from 'class-validator';
import { Trim } from 'src/infrastructure/decorators/transform/trim.decorator';
import { IsBlogIdExist } from 'src/infrastructure/decorators/validate/blog-exists.decorator';

const VALIDATE_PHARAMS = {
  titleMaxLength: 30,
  shortDescriptionMaxLength: 100,
  contentMaxLength: 1000,
};

export class CreatePostModel {
  @IsDefined()
  @Trim()
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.titleMaxLength)
  title: string;
  @IsDefined()
  @Trim()
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.shortDescriptionMaxLength)
  shortDescription: string;
  @IsDefined()
  @Trim()
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.contentMaxLength)
  content: string;
  @IsDefined()
  @Trim()
  @IsBlogIdExist({
    message: 'BlogId not found',
  })
  blogId: string;
}
