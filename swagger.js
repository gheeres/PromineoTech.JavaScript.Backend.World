import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Countries of the World",
      version: "0.0.1",
      description: "A sample backend API for countries and cities of the world for front-end testing & development.",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html"
      },
      contact: {
        name: "George Heeres",
        url: "https://blog.heeresonline.com",
        email: "gheeres@gmail.com"
      }
    },
    servers: [
      { url: "http://localhost:3000" }
    ]
  },
  apis: [ 
    './models/*.js',
    './models/input/*.js',
    './models/filter/*.js',
    './controllers/*.js' 
  ]
};

const app = Router();
const specs = swaggerJsdoc(options);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { 
    explorer: false,
    swaggerOptions: {
      syntaxHighlight: {
        activated: false,
        theme: "agate"
      }  
    }
  })
);

export default app;