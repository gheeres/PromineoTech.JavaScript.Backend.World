import { Router } from 'express';
import WorldService from "../service/WorldService.js";

const TAG = `HomeController`;

const service = new WorldService();
const app = Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System level methods and utilities
 * /initialize:
 *   post:
 *     summary: Initializes or resets the underlying database.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Indicates a successful reset
 *       500:
 *         description: Some server error
 */
app.post('/initialize', async (req, res) => {
  console.debug(`${ TAG }: GET /initialize`);
  res.send('Initializing / resetting the Countries of the World underlying database...');
  await service.initialize()
});

app.get('/', async (req, res) => {
  console.debug(`${ TAG }: GET /`);
  res.send('Countries of the World API');
});

export default app;
