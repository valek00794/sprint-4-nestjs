import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Trim } from 'src/infrastructure/decorators/transform/trim.decorator';

const VALIDATE_PHARAMS = {
  body: {
    minLength: 10,
    maxLength: 500,
  },
};

export class QuestionInputModel {
  @Trim()
  @IsNotEmpty()
  @Length(VALIDATE_PHARAMS.body.minLength, VALIDATE_PHARAMS.body.maxLength)
  body: string;
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  correctAnswers: [string];
}

export class PublishQuestionStatusInputModel {
  @IsDefined()
  @IsBoolean()
  @IsIn([true, false])
  published: boolean;
}

export class AnswerInputModel {
  @Trim()
  @IsNotEmpty()
  answer: string;
}
