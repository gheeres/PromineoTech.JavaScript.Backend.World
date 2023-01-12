/**
 * @swagger
 * components:
 *   schemas:
 *     CountryModel:
 *       type: object
 *       description: Details about a country or govement of the world
 *       required:
 *         - country_code
 *         - continent
 *         - country_name
 *       properties:
 *         country_code:
 *           type: string
 *           description: The ISO3155-1 alpha-3 country identifier
 *         country_code2:
 *           type: string
 *           description: The ISO3155-1 alpha-2 country identifier
 *         country_name:
 *           type: string
 *           description: The official name of the country
 *         continent:
 *           type: string
 *           description: The continent where the country is located. (Asia, Europe, North America, Africa, Oceania, Antarctica, South America)
 *         capital:
 *           description: The capital city or recognized place of goverment
 *           $ref: '#/components/schemas/CityBaseModel'
 *         country_population:
 *           type: integer
 *           format: int64
 *           minimum: 0
 *           description: The recorded population of the country
 *       example:
 *         country_code: USA
 *         country_code2: US
 *         country_name: United States of America
 *         continent: North America
 *         capital: 
 *           city_id: 8321
 *           city_name: Washington
 *         country_population: 278357000
 */
import CountryBaseModel from './CountryBaseModel.js';

/**
 * Details about a country or govement of the world
 */
export default class CountryModel extends CountryBaseModel {
  //country_code;
  //country_code2;
  //country_name;
  //continent;
  //capital;
  //country_population;

  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `[${ this.country_code }] ${ this.country_name }`;
  }
}