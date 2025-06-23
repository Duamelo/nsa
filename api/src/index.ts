import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createConnection } from 'typeorm';
import routes from './routes';

import * as dotenv from 'dotenv';
import { logRequest } from './middlewares/logRequest';
import '../src/logger/otel';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

const connectDatabase = async () => {
  try {
    await createConnection({
      type: process.env.DB_TYPE as 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      entities: [
        __dirname + '/entity/**/*.ts',
        __dirname + '/entity/**/*.js'
      ],
      charset: 'utf8mb4'
    });
    console.log('✅ Connexion à la base de données MySQL réussie !');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
};

// Routes
app.use(logRequest);
app.use('/api', routes);


// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'API de gestion de stock',
    database: 'dev_db',
    status: 'running'
  });
});


const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}!`);
      console.log(`📊 Database: dev_db`);
      console.log(`🌐 API disponible sur: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
  }
};

startServer();