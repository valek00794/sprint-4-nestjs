import { IsValidFile } from 'src/infrastructure/decorators/validate/valid-file.decorator';

export const BLOG_WALLPAPER = {
  MAX_SIZE: 0.1, //100 кб
  NEED_WIDTH: 1028, //px
  NEED_HEIGHT: 312, //px
};

export class BlogWallpaperFile {
  @IsValidFile(BLOG_WALLPAPER.MAX_SIZE, BLOG_WALLPAPER.NEED_WIDTH, BLOG_WALLPAPER.NEED_HEIGHT)
  file: Express.Multer.File;
}

export const BLOG_MAIN_IMAGE = {
  MAX_SIZE: 0.1, //100 кб
  NEED_WIDTH: 156, //px
  NEED_HEIGHT: 156, //px
};

export class BlogMainFile {
  @IsValidFile(BLOG_MAIN_IMAGE.MAX_SIZE, BLOG_MAIN_IMAGE.NEED_WIDTH, BLOG_MAIN_IMAGE.NEED_HEIGHT)
  file: Express.Multer.File;
}

export const POST_MAIN_IMAGE = {
  MAX_SIZE: 0.1, //100 кб
  NEED_WIDTH: 940, //px
  NEED_HEIGHT: 432, //px
};

export class PostMainFile {
  @IsValidFile(POST_MAIN_IMAGE.MAX_SIZE, POST_MAIN_IMAGE.NEED_WIDTH, POST_MAIN_IMAGE.NEED_HEIGHT)
  file: Express.Multer.File;
}
