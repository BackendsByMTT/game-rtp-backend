import { config as conf } from "dotenv";
import { platform } from "os";
conf();

const _config = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.MONGOURL,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  crm: process.env.CRM,
  platform: process.env.PLATFORM,
};

export const config = Object.freeze(_config);
