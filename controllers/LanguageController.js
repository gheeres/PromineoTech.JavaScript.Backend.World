import WorldService from "../service/WorldService.js";
import Response from "../models/Response.js";
import LanguageModel from "../models/LanguageModel.js";
import LanguageBaseModel from "../models/LanguageBaseModel.js";
import LanguageAddModel from "../models/input/LanguageAddModel.js";
import LanguageUpdateModel from "../models/input/LanguageUpdateModel.js";
import LanguageFilter from "../models/filter/LanguageFilter.js";
import { Router } from 'express';

const TAG = `LanguageController`;

const service = new WorldService();
const app = Router();

/**
 * @swagger
 * /languages/find:
 *   get:
 *     summary: Searches for a language matching all or part of the specified criteria.
 *     tags: [Language]
 *     parameters:
 *     - name: language_name
 *       description: The name or part of a language name to match
 *       in: query
 *       required: false
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: The matching languages.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LanguageModel'
 *       500:
 *         description: Some server error
 */
app.get('/languages/find', async (req, res) => {
  const filter = LanguageFilter.fromHTTPRequest(req);
  console.debug(`${ TAG }: GET /languages/find?language_name=${ filter.language_name || '' }`);

  if ((! filter.language_name)) {
    return res.status(400).send('Invalid or empty filter provided for search.');
  }

  const languages = await service.getLanguages(filter);
  if (languages.length) {
    return res.send(languages);
  }
  return res.status(404).send(`No languages found for specified filter: ${ JSON.stringify(filter) }).`);
});

/**
 * @swagger
 * /languages/{code}:
 *   get:
 *     summary: Retrieves the language by it's unique ISO639-3 identifier code.
 *     tags: [Language]
 *     parameters:
 *     - name: code
 *       description: The ISO639-3 identifier.
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: The language if found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LanguageModel'
 *       500:
 *         description: Some server error
 */
app.get('/languages/:code', async (req, res) => {
  const code = req.params.code;
  console.debug(`${ TAG }: GET /languages/${ code }`);

  if ((! code) ||
      (code.length < 2) || (code.length > 3)) {
    return res.status(400).send(`Empty or invalid ISO639-3 identifier specified.${ code ? ` Code: ${ code }` : '' }`);
  }

  const language = await service.getLanguage(code);
  if (language) {
    return res.send(language);
  }
  return res.status(404).send(`No language found with specified ISO639-3 identifier (${ code }).`);
});

/**
 * @swagger
 * /languages:
 *   get:
 *     summary: Retrieves all of the available languages.
 *     tags: [Language]
 *     responses:
 *       200:
 *         description: The languages.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LanguageModel'
 *       500:
 *         description: Some server error
 */
app.get('/languages', async (req, res) => {
  console.debug(`${ TAG }: GET /languages`);

  const languages = await service.getLanguages();
  if (languages.length) {
    return res.send(languages);
  }
  return res.status(404).send(`No languages found.`);
});

/**
 * @swagger
 * /languages:
 *   post:
 *     summary: Creates a new language.
 *     tags: [Language]
 *     requestBody:
 *       description: The language to create.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LanguageAddModel'
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
 *                 description: The language information if operation was successful. If non-successful, then data is null or not present.
 *                 $ref: '#/components/schemas/LanguageModel'
 *       500:
 *         description: Some server error
 */
app.post('/languages', async (req, res) => {
  const input = LanguageAddModel.fromHTTPRequest(req);
  console.debug(`${ TAG }: POST /languages; Content: ${ JSON.stringify(input) }`);

  if ((! input) || (! input.isValid())) {
    return res.status(400).send(new Response(400, `Invalid language input. Invalid data or missing properties.`, { input: input }));
  }

  let existing = await service.getLanguage(input.language_code);
  if ((! existing) && (input.language_code2)) {
    existing = await service.getLanguage(input.language_code2);
  }

  if (! existing) {
    const response = await service.addLanguage(input);
    if (response.isSuccessStatusCode()) {
      return res.send(response);
    }
    return res.status(response.code).send(response);
  }
  return res.status(403).send(new Response(402, `Specified language code (${ input.language_code }) already exists. Duplicate language.`, existing));
});

/**
 * @swagger
 * /languages/{code}:
 *   put:
 *     summary: Updates or changes information about a language.
 *     tags: [Language]
 *     requestBody:
 *       description: The language to modify or update.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LanguageUpdateModel'
 *     parameters:
 *     - name: code
 *       description: ISO639-3 identifier code
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
 *                 description: The language information if operation was successful. If non-successful, then data is null or not present.
 *                 $ref: '#/components/schemas/LanguageModel'
 *       500:
 *         description: Some server error
 */
app.put('/languages/:code', async (req, res) => {
  const language_code = req.params.code;
  const input = LanguageUpdateModel.fromHTTPRequest(req);
  console.debug(`${ TAG }: PUT /languages/${ (language_code || req.params.code) }; Content: ${ JSON.stringify(input) }`);

  if ((! language_code) || 
      (language_code.length < 2) || (language_code.length > 3)) {
    return res.status(400).send(new Response(400, `Invalid language identifier specified. Expected valid ISO639-3 identifier code.${ (language_code || req.params.code ) ? ` Code: ${ language_code || req.params.code }` : '' }`));
  }

  const language = await service.getLanguage(language_code);
  if (language) {
    const response = await service.updateLanguage(language.language_code, input);
    if (response.isSuccessStatusCode([ 304 ])) { // 304: Not Modified is OK
      return res.send(response);
    }
    return res.status(response.code).send(response);
  }
  return res.status(404).send(new Response(404, `No language found with specified unique identifier (${ language_code }).`));
});

/**
 * @swagger
 * /languages/{code}:
 *   delete:
 *     summary: Deletes or removes a language.
 *     tags: [Language]
 *     parameters:
 *     - name: code
 *       description: ISO639-3 identifier code
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
 *                 description: The removed language information if operation was successful. If non-successful, then data is null or not present.
 *                 $ref: '#/components/schemas/LanguageModel'
 *       500:
 *         description: Some server error
 */
app.delete('/languages/:code', async (req, res) => {
  const language_code = req.params.code;
  console.debug(`${ TAG }: DELETE /languages/${ (language_code || req.params.code) }`);

  if ((! language_code) || 
      (language_code.length < 2) || (language_code.length > 3)) {
    return res.status(400).send(new Response(400, `Invalid language identifier specified. Expected valid ISO639-3 identifier code.${ req.params.language_code ? ` Code: ${ req.params.language_code }` : '' }`));
  }
  const existing = await service.getLanguage(language_code);
  if (existing) {
    const response = await service.deleteLanguage(existing.language_code);
    if (response.isSuccessStatusCode()) {
      return res.send(response);
    }
    return res.status(response.code).send(response);
  }
  return res.status(404).send(new Response(404, `No language found with specified unique identifier (${ language_code }).`));
});

export default app;