import { Options } from 'swagger-jsdoc';
import path from 'path';

const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de gestion de stock',
            version: '1.0.0',
            description: "Documentation de l’API pour la gestion de stock",
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        path.join(__dirname, '../src/routes/*.js'),  // Correct pour les routes
        path.join(__dirname, '../src/entity/*.js'),  // Si tu documentes aussi les entités
    ],
};

export default swaggerOptions;
