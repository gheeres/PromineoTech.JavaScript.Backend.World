/**
 * @swagger
 * components:
 *   schemas:
 *     CountryAddModel:
 *       type: object
 *       description: Information about a country for creation or addition
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
 *         country_capital:
 *           description: The unique id of the capital city
 *           type: integer
 *           format: int64
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
 *         country_capital: 8321
 *         country_population: 278357000
 */
import InputModel from './InputModel.js';

/**
 * Details about a country
 */
export default class CountryAddModel extends InputModel {
  //country_code;
  //country_code2;
  //country_name;
  //continent
  //country_capital;
  //country_population;

  /**
   * Creates an instance of the CountryAddModel class.
   * @param {Object} properties The properties for the update
   */
  constructor(properties) {
    super();
    Object.assign(this, properties || {});
  }

  /**
   * Creates an instance of the CountryAddModel class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {CountryAddModel} The configured input model.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new CountryAddModel(req.body);
    }
    return new CountryAddModel();
  }

  /**
   * Checks to see if the data is valid.
   * @returns {Boolean} True if valid, false if otherwise.
   */
  isValid() {
    return (this.country_code.trim() !== '') &&
           (this.continent.trim() !== '') &&
           (this.country_name.trim() !== '');
  }
}