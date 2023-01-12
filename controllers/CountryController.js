/**
 * @swagger
 * tags:
 *   name: Country
 *   description: APIs for retrieving and modifying country information
 */
import WorldService from "../service/WorldService.js";
import Response from "../models/Response.js";
import CountryModel from "../models/CountryModel.js";
import CountryBaseModel from "../models/CountryBaseModel.js";
import CountryAddModel from "../models/input/CountryAddModel.js";
import CountryUpdateModel from "../models/input/CountryUpdateModel.js";
import CountryFilter from "../models/filter/CountryFilter.js";
import { Router } from 'express';

const TAG = `CountryController`;

const service = new WorldService();
const app = Router();

/**
 * @swagger
 * /countries/find:
 *   get:
 *     summary: Searches for a country matching all or part of the specified criteria.
 *     tags: [Country]
 *     parameters:
 *     - name: country_name
 *       description: The name or part of a country name to match
 *       in: query
 *       required: false
 *       schema:
 *         type: string
 *     - name: continent
 *       description: The optional continent where the country is located. (Asia, Europe, North America, Africa, Oceania, Antarctica, South America)
 *       in: query
 *       required: false
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: The matching countries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CountryModel'
 *       500:
 *         description: Some server error
 */
app.get('/countries/find', async (req, res) => {
  const filter = CountryFilter.fromHTTPRequest(req);
  console.debug(`${ TAG }: GET /countries/find?country_name=${ filter.country_name || '' }&continent=${ filter.continent || '' }`);

  if ((! filter.country_name) &&
      (! filter.continent)) {
    return res.status(400).send('Invalid or empty filter provided for search.');
  }

  const countries = await service.getCountries(filter);
  if (countries.length) {
    return res.send(countries);
  }
  return res.status(404).send(`No countries found for specified filter: ${ JSON.stringify(filter) }).`);
});

/**
 * @swagger
 * /countries/{code}:
 *   get:
 *     summary: Retrieves the country by it's unique ISO3155-1 identifier code.
 *     tags: [Country]
 *     parameters:
 *     - name: code
 *       description: The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: The country if found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountryModel'
 *       500:
 *         description: Some server error
 */
app.get('/countries/:code', async (req, res) => {
  const code = req.params.code;
  console.debug(`${ TAG }: GET /countries/${ code }`);

  if ((! code) ||
      (code.length < 2) || (code.length > 3)) {
    return res.status(400).send(`Empty or invalid ISO3155-1 identifier specified.${ code ? ` Code: ${ code }` : '' }`);
  }

  const country = await service.getCountry(code);
  if (country) {
    return res.send(country);
  }
  return res.status(404).send(`No country found with specified ISO3155-1 identifier (${ code }).`);
});

/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Retrieves all of the available countries.
 *     tags: [Country]
 *     responses:
 *       200:
 *         description: The countries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CountryModel'
 *       500:
 *         description: Some server error
 */
app.get('/countries', async (req, res) => {
  console.debug(`${ TAG }: GET /countries`);

  const countries = await service.getCountries();
  if (countries.length) {
    return res.send(countries);
  }
  return res.status(404).send(`No countries found.`);
});

/**
 * @swagger
 * /countries:
 *   post:
 *     summary: Creates a new country.
 *     tags: [Country]
 *     requestBody:
 *       description: The country to create.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CountryAddModel'
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
 *                 description: The country information if operation was successful. If non-successful, then data is null or not present.
 *                 $ref: '#/components/schemas/CountryModel'
 *       500:
 *         description: Some server error
 */
app.post('/countries', async (req, res) => {
  const input = CountryAddModel.fromHTTPRequest(req);
  console.debug(`${ TAG }: POST /countries; Content: ${ JSON.stringify(input) }`);

  if ((! input) || (! input.isValid())) {
    return res.status(400).send(new Response(400, `Invalid country input. Invalid data or missing properties.`, { input: input }));
  }

  let existing = await service.getCountry(input.country_code);
  if ((! existing) && (input.country_code2)) {
    existing = await service.getCountry(input.country_code2);
  }

  if (! existing) {
    const response = await service.addCountry(input);
    if (response.isSuccessStatusCode()) {
      return res.send(response);
    }
    return res.status(response.code).send(response);
  }
  return res.status(403).send(new Response(402, `Specified country code (${ input.country_code }) already exists. Duplicate country.`, existing));
});

/**
 * @swagger
 * /countries/{code}:
 *   put:
 *     summary: Updates or changes information about a country.
 *     tags: [Country]
 *     requestBody:
 *       description: The country to modify or update.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CountryUpdateModel'
 *     parameters:
 *     - name: code
 *       description: ISO3155-1 identifier code
 *       in: path
 *       required: true
 *       schema:
 *         type: string
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
 *                 description: The country information if operation was successful. If non-successful, then data is null or not present.
 *                 $ref: '#/components/schemas/CountryModel'
 *       500:
 *         description: Some server error
 */
app.put('/countries/:code', async (req, res) => {
  const country_code = req.params.code;
  const input = CountryUpdateModel.fromHTTPRequest(req);
  console.debug(`${ TAG }: PUT /countries/${ (country_code || req.params.code) }; Content: ${ JSON.stringify(input) }`);

  if ((! country_code) || 
      (country_code.length < 2) || (country_code.length > 3)) {
    return res.status(400).send(new Response(400, `Invalid country identifier specified. Expected valid ISO3155-1 identifier code.${ (country_code || req.params.code ) ? ` Code: ${ country_code || req.params.code }` : '' }`));
  }

  const country = await service.getCountry(country_code);
  if (country) {
    const response = await service.updateCountry(country.country_code, input);
    if (response.isSuccessStatusCode([ 304 ])) { // 304: Not Modified is OK
      return res.send(response);
    }
    return res.status(response.code).send(response);
  }
  return res.status(404).send(new Response(404, `No country found with specified unique identifier (${ country_code }).`));
});

/**
 * @swagger
 * /countries/{code}:
 *   delete:
 *     summary: Deletes or removes a country.
 *     tags: [Country]
 *     parameters:
 *     - name: code
 *       description: ISO3155-1 identifier code
 *       in: path
 *       required: true
 *       schema:
 *         type: string
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
 *                 description: The removed country information if operation was successful. If non-successful, then data is null or not present.
 *                 $ref: '#/components/schemas/CountryModel'
 *       500:
 *         description: Some server error
 */
app.delete('/countries/:code', async (req, res) => {
  const country_code = req.params.code;
  console.debug(`${ TAG }: DELETE /countries/${ (country_code || req.params.code) }`);

  if ((! country_code) || 
      (country_code.length < 2) || (country_code.length > 3)) {
    return res.status(400).send(new Response(400, `Invalid country identifier specified. Expected valid ISO3155-1 identifier code.${ req.params.country_code ? ` Code: ${ req.params.country_code }` : '' }`));
  }
  const existing = await service.getCountry(country_code);
  if (existing) {
    const response = await service.deleteCountry(existing.country_code);
    if (response.isSuccessStatusCode()) {
      return res.send(response);
    }
    return res.status(response.code).send(response);
  }
  return res.status(404).send(new Response(404, `No country found with specified unique identifier (${ country_code }).`));
});

export default app;