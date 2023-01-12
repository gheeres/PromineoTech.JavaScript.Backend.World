import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import morgan from 'morgan';

import swagger from './swagger.js';
import HomeController from './controllers/HomeController.js';
import CountryController from './controllers/CountryController.js';
import CityController from './controllers/CityController.js';

const port = 3000;
const app = express();

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

// Routes
app.use(HomeController);
app.use(CountryController);
app.use(CityController);

// Swagger API / Routing
app.use(swagger);

app.listen(port, () => {
  console.info(`Application listening on port ${ port }`);
});