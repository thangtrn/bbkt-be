import '@/libs/utils/dotenv';
import { get } from 'env-var';

export const systemConfig = {
  env: get('NODE_ENV').required().asString(),
  port: get('PORT').required().required().asPortNumber(),
};
