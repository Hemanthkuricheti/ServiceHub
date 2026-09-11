import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { swaggerSpec } from './config/swagger.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'ServiceHub API Docs' }));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
