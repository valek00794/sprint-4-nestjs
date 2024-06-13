import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import { ApiRequest, ApiRequestDocument } from './apiRequests.schema';
import { ResultStatus } from 'src/settings/settings';

const REQUESTS_LOG_SETTING = {
  maxCount: 5,
  timeRange: 10,
};

@Injectable()
export class ApiRequestsLogMiddleware implements NestMiddleware {
  constructor(@InjectModel(ApiRequest.name) private apiRequestsModel: Model<ApiRequestDocument>) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, path } = request;
    const currentDate = new Date();

    const apiRequest = new this.apiRequestsModel({
      IP: ip,
      URL: path,
      date: currentDate,
    });
    apiRequest.save();
    next();
  }
}

@Injectable()
export class ApiRequestsCounterMiddleware implements NestMiddleware {
  constructor(@InjectModel(ApiRequest.name) private apiRequestsModel: Model<ApiRequestDocument>) {}

  async use(request: Request, response: Response, next: NextFunction): Promise<void> {
    const { ip, path } = request;
    const currentDate = new Date();
    const tenSecondsAgo = new Date(currentDate.getTime() - REQUESTS_LOG_SETTING.timeRange * 1000);
    const requestsCount = await this.apiRequestsModel.countDocuments({
      IP: ip,
      URL: path,
      date: { $gte: tenSecondsAgo },
    });
    if (requestsCount <= REQUESTS_LOG_SETTING.maxCount) {
      return next();
    }
    throw new HttpException(ResultStatus.TooManyRequests, HttpStatus.TOO_MANY_REQUESTS);
  }
}
