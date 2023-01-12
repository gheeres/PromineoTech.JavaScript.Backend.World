/**
 * @swagger
 * components:
 *   schemas:
 *     CountryBaseModel:
 *       type: object
 *       description: Minimal information about a country or govement of the world
 *       required:
 *         - country_code
 *         - country_name
 *       properties:
 *         country_code:
 *           type: string
 *           description: The ISO3155-1 alpha-3 country identifier
 *         country_name:
 *           type: string
 *           description: The official name of the country
 *       example:
 *         country_code: USA
 *         country_name: United States of America
 */
import Model from './Model.js';

/**
 * Minimal information about a country or govement of the world
 */
export default class CountryBaseModel extends Model {
  //country_code;
  //country_name;

  /**
   * Creates an instance of the CountryBaseModel class.
   * @param {String} country_code The ISO3155-1 alpha-3 country identifier
   * @param {String} country_name The official name of the country
   */
  constructor(country_code, country_name) {
    super();
    this.country_code = country_code;
    this.country_name = country_name;
  }  
  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `[${ this.country_code }] ${ this.country_name }`;
  }
}