/**
 * @swagger
 * tags:
 *   name: City
 *   description: APIs for retrieving and modifying city information
*/
import WorldService from "../service/WorldService.js";
import Response from "../models/Response.js";
import CityModel from "../models/CityModel.js";
import CityBaseModel from "../models/CityBaseModel.js";
import CityAddModel from "../models/input/CityAddModel.js";
import CityUpdateModel from "../models/input/CityUpdateModel.js";
import CityFilter from "../models/filter/CityFilter.js";

import { Router } from 'express';

const TAG = `CityController`;

const service = new WorldService();
const app = Router();

/**
 * @swagger
 * /countries/{code}/cities:
 *   get:
 *     summary: Retrieves all of the cities for a country.
 *     tags: [City,Country]
 *     parameters:
 *     - name: code
 *       description: The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: The cities located in the specified country.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CityModel'
 *       500:
 *         description: Some server error
 */
app.get('/countries/:code/cities', async (req, res) => {
  const code = req.params.code;
  console.debug(`${ TAG }: GET /countries/${ code }/cities`);

  if (! code) {
    return res.status(400).send(`Empty or invalid ISO3155-1 identifier specified.${ code ? `Code: ${ code }` : '' }`);
  }

  const cities = await service.getCities({ country_code: code });
  if (cities.length) {
    return res.send(cities);
  }
  return res.status(404).send(`No cities found for requested country (${ code }).`);
});

/**
 * @swagger
 * /cities/find:
 *   get:
 *     summary: Searches for a city matching all or part of the specified criteria.
 *     tags: [City]
 *     parameters:
 *     - name: city_name
 *       description: The name or part of a city name to match
 *       in: query
 *       required: true
 *       schema:
 *         type: string
 *     - name: country_code
 *       description: The optional ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported
 *       in: query
 *       required: false
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: The matching cities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CityModel'
 *       500:
 *         description: Some server error
 */
app.get('/cities/find', async (req, res) => {
  const filter = CityFilter.fromHTTPRequest(req);
  console.debug(`${ TAG }: GET /cities/find?city_name=${ filter.city_name || '' }&country_code=${ filter.country_code  || ''}`);

  if (! filter.city_name) {
    return res.status(400).send('Invalid or empty filter provided for search.');
  }

  const cities = await service.getCities(filter);
  if (cities.length) {
    return res.send(cities);
  }
  return res.status(404).send(`No cities found for specified filter: ${ JSON.stringify(filter) }).`);
});

/**
 * @swagger
 * /cities/{id}:
 *   get:
 *     summary: Retrieves the city matching the specified internal identifier.
 *     tags: [City]
 *     parameters:
 *     - name: id
 *       description: The internal identifier of the city
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *     responses:
 *       200:
 *         description: The city if found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CityModel'
 *       500:
 *         description: Some server error
 */
app.get('/cities/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.debug(`${ TAG }: GET /cities/${ (id || req.params.id) }`);

  if (! id) {
    return res.status(400).send(`Invalid city identifier specified. Expected numeric value greater than 0.${ req.params.id ? ` Id: ${ req.params.id }` : '' }`);
  }

  const city = await service.getCity(id);
  if (city) {
    return res.send(city);
  }
  return res.status(404).send(`No city found with specified unique identifier (${ id }).`);
});

/**
 * @swagger
 * /cities:
 *   get:
 *     summary: Retrieves all of the available cities.
 *     tags: [City]
 *     responses:
 *       200:
 *         description: The cities.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               code:
 *                 type: integer
 *                 format: int32 
 *                 description: The internal status code associated with the operation.
 *               message:
 *                 type: string
 *                 description: A message regarding the status of the operation.
 *               data:
 *                 description: The city information if operation was successful. If non-successful, then data is null or not present.
 *                 $ref: '#/components/schemas/CityModel'
 *       500:
 *         description: Some server error
 */
app.get('/cities', async (req, res) => {
  console.debug(`${ TAG }: GET /cities`);

  const cities = await service.getCities();
  if (cities.length) {
    return res.send(cities);
  }
  return res.status(404).send(`No cities found.`);
});

/**
 * @swagger
 * /cities:
 *   post:
 *     summary: Creates a new city.
 *     tags: [City]
 *     requestBody:
 *       description: The city to create.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CityAddModel'
 *     responses:
 *       200:
 *         description: A status response message containing related data.
 *         content:
 *           application/json:
 *               type: object
 *               code:
 *                 type: integer
 *                 format: int32 
 *                 description: The internal status code associated with the operation.
 *               message:
 *                 type: string
 *                 description: A message regarding the status of the operation.
 *               data:
 *                 description: The city information if operation was successful. If non-successful, then data is null or not present.
 *                 $ref: '#/components/schemas/CityModel'
 *       500:
 *         description: Some server error
 */
app.post('/cities', async (req, res) => {
  const input = CityAddModel.fromHTTPRequest(req);
  console.debug(`${ TAG }: POST /cities; Content: ${ JSON.stringify(input) }`);

  if ((! input) || (! input.isValid())) {
    return res.status(400).send(new Response(400, `Invalid city input. Invalid data or missing properties.`, { input: input }));
  }

  const response = await service.addCity(input);
  if (response.isSuccessStatusCode()) {
    return res.send(response);
  }
  return res.status(response.code).send(response);
});

/**
 * @swagger
 * /cities/{id}:
 *   put:
 *     summary: Updates or changes information about a city.
 *     tags: [City]
 *     requestBody:
 *       description: The city to modify or update.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CityUpdateModel'
 *     parameters:
 *     - name: id
 *       description: The internal identifier of the city
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *     responses:
 *       200:
 *         description: A status response message containing related data.
 *         content:
 *           application/json:
 *               type: object
 *               code:
 *                 type: integer
 *                 format: int32 
 *                 description: The internal status code associated with the operation.
 *               message:
 *                 type: string
 *                 description: A message regarding the status of the operation.
 *               data:
 *                 description: The city information if operation was successful. If non-successful, then data is null or not present.
 *                 $ref: '#/components/schemas/CityModel'
 *       500:
 *         description: Some server error
 */
app.put('/cities/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const input = CityUpdateModel.fromHTTPRequest(req);
  console.debug(`${ TAG }: PUT /cities/${ (id || req.params.id) }; Content: ${ JSON.stringify(input) }`);

  if (! id) {
    return res.status(400).send(new Response(400, `Invalid city identifier specified. Expected numeric value greater than 0.${ req.params.id ? ` Id: ${ req.params.id }` : '' }`));
  }

  const city = await service.getCity(id);
  if (city) {
    const response = await service.updateCity(id, input);
    if (response.isSuccessStatusCode([ 304 ])) { // 304: Not Modified is OK
      return res.send(response);
    }
    return res.status(response.code).send(response);
  }
  return res.status(404).send(new Response(404, `No city found with specified unique identifier (${ id }).`));
});

/**
 * @swagger
 * /cities/{id}:
 *   delete:
 *     summary: Deletes or removes a city.
 *     tags: [City]
 *     parameters:
 *     - name: id
 *       description: The internal identifier of the city
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *     responses:
 *       200:
 *         description: A status response message containing related data.
 *         content:
 *           application/json:
 *               type: object
 *               code:
 *                 type: integer
 *                 format: int32 
 *                 description: The internal status code associated with the operation.
 *               message:
 *                 type: string
 *                 description: A message regarding the status of the operation.
 *               data:
 *                 description: The removed city information if operation was successful. If non-successful, then data is null or not present.
 *                 $ref: '#/components/schemas/CityModel'
 *       500:
 *         description: Some server error
 */
app.delete('/cities/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.debug(`${ TAG }: DELETE /cities/${ (id || req.params.id) }`);

  if (! id) {
    return res.status(400).send(new Response(400, `Invalid city identifier specified. Expected numeric value greater than 0.${ req.params.id ? ` Id: ${ req.params.id }` : '' }`));
  }
  const existing = await service.getCity(id);
  if (existing) {
    const response = await service.deleteCity(existing.city_id);
    if (response.isSuccessStatusCode()) {
      return res.send(response);
    }
    return res.status(response.code).send(response);
  }
  return res.status(404).send(new Response(404, `No city found with specified unique identifier (${ id }).`));
});

export default app;
