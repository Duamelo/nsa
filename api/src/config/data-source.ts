import { DataSource } from "typeorm";
import { config } from "dotenv";
import path from 'path';

config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [path.join('..', 'entity', '**', '*.{ts,js}')],
  migrations: [path.join('..', 'migration', '**', '*.{ts,js}')],
  charset: 'utf8mb4',
});
