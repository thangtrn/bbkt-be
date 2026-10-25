import '@/libs/utils/dotenv';
import { get } from 'env-var';

export const uploadConfig = {
  uploadFolder: get('UPLOAD_FOLDER').required().asString(),
};
