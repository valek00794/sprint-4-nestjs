import { IsNotEmpty, Matches, MaxLength } from 'class-validator';

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
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.nameMaxLength)
  name: string;
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.descriptionMaxLength)
  description: string;
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.websiteUrlMaxLength)
  @Matches(VALIDATE_PHARAMS.websiteUrlPattern)
  websiteUrl: string;
}
export class CreatePostForBlogModel {
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.titleMaxLength)
  title: string;
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.shortDescriptionMaxLength)
  shortDescription: string;
  @IsNotEmpty()
  @MaxLength(VALIDATE_PHARAMS.contentMaxLength)
  content: string;
  blogId: string;
}
