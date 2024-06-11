import { IsNotEmpty, Length } from 'class-validator';
import { Trim } from 'src/infrastructure/decorators/transform/trim.decorator';

const VALIDATE_PHARAMS = {
  content: {
    minLength: 20,
    maxLength: 300,
  },
};
export class CreateCommentModel {
  @Trim()
  @IsNotEmpty()
  @Length(VALIDATE_PHARAMS.content.minLength, VALIDATE_PHARAMS.content.maxLength)
  content: string;
}
