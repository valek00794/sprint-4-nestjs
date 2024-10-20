import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import sharp from 'sharp';

export const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png'];

@ValidatorConstraint({ name: 'isValidFile', async: true })
export class IsValidFileConstraint implements ValidatorConstraintInterface {
  private readonly maxSize: number;
  private readonly maxWidth: number;
  private readonly maxHeight: number;

  constructor(maxSize: number, maxWidth: number, maxHeight: number) {
    this.maxSize = maxSize;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
  }

  async validate(file: Express.Multer.File, args: ValidationArguments) {
    if (!file) return false;

    // Проверка размера файла
    if (file.size > this.maxSize * 1024 * 1024) return false;

    // Проверка типа файла
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) return false;

    // Проверка размеров изображения
    const metadata = await sharp(file.buffer).metadata();
    const width = metadata.width;
    const height = metadata.height;
    if (width === undefined || height === undefined) return false;
    if (width > this.maxWidth || height > this.maxHeight) return false;

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `File must be present, less than ${this.maxSize} MB, of type: ${ALLOWED_MIMETYPES.join(', ')}, 
      and dimensions WxH at least ${this.maxWidth}x${this.maxHeight} pixels.`;
  }
}

export function IsValidFile(
  maxSize: number,
  maxWidth: number,
  maxHeight: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isValidFile',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: new IsValidFileConstraint(maxSize, maxWidth, maxHeight),
    });
  };
}
