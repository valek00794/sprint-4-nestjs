import { IsValidFile } from 'src/infrastructure/decorators/validate/valid-file.decorator';

export const BLOG_WALLPAPER = {
  MAX_SIZE: 0.1, //100 кб
  MAX_WIDTH: 1028, //px
  MAX_HEIGHT: 312, //px
};

export class BlogWallpaperFile {
  @IsValidFile(BLOG_WALLPAPER.MAX_SIZE, BLOG_WALLPAPER.MAX_WIDTH, BLOG_WALLPAPER.MAX_HEIGHT)
  file: Express.Multer.File;
}

export const BLOG_ICON = {
  MAX_SIZE: 0.1, //100 кб
  MAX_WIDTH: 156, //px
  MAX_HEIGHT: 156, //px
};

export class BlogMainFile {
  @IsValidFile(BLOG_ICON.MAX_SIZE, BLOG_ICON.MAX_WIDTH, BLOG_ICON.MAX_HEIGHT)
  file: Express.Multer.File;
}
