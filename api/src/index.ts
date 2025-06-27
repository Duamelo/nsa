import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';

import * as dotenv from 'dotenv';
import { logRequest } from './middlewares/logRequest';
import '../src/logger/otel';
import { AppDataSource } from './config/data-source';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());


export const connectDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données MySQL réussie !');
    console.log(`Env: ${process.env.NODE_ENV}`);

    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Exécution des migrations...');
      await AppDataSource.runMigrations();
      console.log('✅ Migrations exécutées avec succès.');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données :', error);
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