import { IsDefined, IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { Trim } from 'src/infrastructure/decorators/transform/trim.decorator';

const VALIDATE_PHARAMS = {
  nameMaxLength: 15,
  descriptionMaxLength: 500,
  websiteUrlMaxLength: 100,
  websiteUrlPattern: '^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$',

  titleMaxLength: 30,
  shortDescriptionMaxLength: 100,
  contentMaxLength: 1000,
};

export class CreateBlogInputModel {
  @Trim()
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.nameMaxLength)
  name: string;
  @Trim()
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.descriptionMaxLength)
  description: string;
  @Trim()
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.websiteUrlMaxLength)
  @Matches(VALIDATE_PHARAMS.websiteUrlPattern)
  websiteUrl: string;
}
export class CreatePostForBlogModel {
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
  @Trim()
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.contentMaxLength)
  content: string;
  blogId: string;
}
