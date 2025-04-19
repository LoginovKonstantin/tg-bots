import axios from 'axios';

export type TParams = {
  telegramUrl: string;
  telegramToken: string;
  telegramChatId: string;
  message: string;
};

export const sendPhotoMessageToTelegram = async ({
  telegramUrl,
  telegramToken,
  telegramChatId,
  message,
}: TParams): Promise<void> => {
  const url = `${telegramUrl}/bot${telegramToken}/sendPhoto?parse_mode=html&chat_id=${telegramChatId}&photo=${message}`;

  await axios.get(url).catch((e) => {
    console.log(e.message);
  });
};
