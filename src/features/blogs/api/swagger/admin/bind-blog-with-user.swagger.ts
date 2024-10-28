import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiBasicAuth, ApiTags } from '@nestjs/swagger';

export function BindBlogWithUserSwagger() {
  return applyDecorators(
    ApiTags('Admin-Blogs'),
    ApiBasicAuth(),
    ApiOperation({ summary: 'Bind Blog with user (if blog doesnt have an owner yet)' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'No Content',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'If the inputModel has incorrect values or blog already bound to any user',
      schema: {
        example: {
          errorsMessages: [
            {
              message: 'string',
              field: 'string',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized',
    }),
  );
}
