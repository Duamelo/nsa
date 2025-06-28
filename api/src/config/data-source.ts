import { DataSource } from "typeorm";
import { config } from "dotenv";
import path from 'path';

config();

const rootDir = process.env.NODE_ENV === 'production' ? 'build' : '..'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [path.join(rootDir, 'entity', '**', '*.{ts,js}')],
  migrations: [path.join(rootDir, 'migration', '**', '*.{ts,js}')],
  charset: 'utf8mb4',
});
