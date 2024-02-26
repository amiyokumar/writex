const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const router = express.Router();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: `WriteX`,
      version: '1.0.0',
      description: `<h4>Documentation of all APIs of Writex application to-
      <ul>
        <li>Users</li>
        <li>Tickets</li>
      </ul>
      JSON Web Tokens (JWT) has been used for authentication and session management and API routes are protected with it.
      </h4> 
      `,
      contact: {
        name: 'Writex Admin',
      },
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
      servers: ['http://localhost:8118'],
    },
  },
  apis: ['./routes/swagger.route.js', './routes/auth.route.js', './routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
router.use('/', swaggerUi.serve);

/**
 * @swagger
 *
 * /api/v1/docs:
 *   get:
 *     description: Use to get swagger documentation of the API
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', swaggerUi.setup(swaggerDocs));

module.exports = router;
