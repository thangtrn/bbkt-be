import { ClientOptions } from 'minio';

export interface MinioOptions extends ClientOptions {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}
