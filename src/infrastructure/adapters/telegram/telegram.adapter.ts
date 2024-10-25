import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { SETTINGS } from 'src/settings/settings';

@Injectable()
export class TelegramAdapter {
  private axiosInstance: AxiosInstance;
  constructor() {
    const token = SETTINGS.TELEGRAM.token;
    this.axiosInstance = axios.create({
      baseURL: `https://api.telegram.org/bot${token}/`,
    });
  }
  async sentMessage(text: string, recipiebtId: number) {
    return await this.axiosInstance.post('sendMessage', {
      chat_id: recipiebtId,
      text: text,
    });
  }

  async setWebhook(url: string) {
    return await this.axiosInstance.post('setWebhook', {
      url,
    });
  }
}

export type TelegramPyloadType = {
  message: {
    from: {
      id: number;
      first_name: string;
      username: string;
    };
    text: string;
    date: number;
  };
};
