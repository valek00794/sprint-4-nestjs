import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags, ApiQuery, ApiBasicAuth } from '@nestjs/swagger';

export function GetBlogsSwagger() {
  return applyDecorators(
    ApiTags('Admin-Blogs'),
    ApiBasicAuth(),
    ApiOperation({ summary: 'Get blogs' }),
    ApiQuery({
      name: 'searchNameTerm',
      required: false,
      description:
        'Search term for blog Name: Name should contains this term in any position. Default value: null',
      type: String,
      example: 'searchNameTerm',
    }),
    ApiQuery({
      name: 'pageNumber',
      required: false,
      description: 'Page number',
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      description: 'Number of items per page',
      type: Number,
      example: 10,
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      description: 'Sort by parameters. Default value: createdAt',
      type: String,
      example: 'createdAt',
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      description: 'Sort by desc or asc. Available values: asc, desc. Default value: desc',
      type: String,
      enum: ['asc', 'desc'],
      example: 'desc',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      schema: {
        example: {
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [
            {
              id: 'adf39cc1-0c5a-452b-bd62-929f366c4dbd',
              name: 'It-inc news',
              description: 'description',
              websiteUrl: 'https://someurl.com',
              createdAt: '2024-10-25T19:12:15.940Z',
              isMembership: false,
              banInfo: {
                isBanned: false,
                banDate: null,
              },
              blogOwnerInfo: {
                userId: '1653b6f4-a65c-4ff1-8fa9-f4a234fcda39',
                userLogin: '1482lg',
              },
            },
          ],
          pagesCount: 1,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized',
    }),
  );
}
