export enum PostImageSizeType {
  Original = 'original',
  Middle = 'middle',
  Small = 'small',
}

export class ImageInfo {
  constructor(
    public main: ImageType[],
    public wallpaper?: ImageType | null,
  ) {}
}

export class ImageType {
  constructor(
    public url: string,
    public width: number,
    public height: number,
    public fileSize: number,
  ) {}
}
