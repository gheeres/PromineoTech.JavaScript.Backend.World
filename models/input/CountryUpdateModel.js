/**
 * @swagger
 * components:
 *   schemas:
 *     CountryUpdateModel:
 *       type: object
 *       description: Information about a country for modification
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
 *           type: integer
 *           format: int32
 *           description: The unique id of the capital city or recognized place of goverment
 *         country_population:
 *           type: integer
 *           format: int64
 *           minimum: 0
 *           description: The recorded population of the country
 *       example:
 *         country_code: USA
 *         country_code2: US
 *         continent: North America
 *         country_capital: 8321
 *         country_name: United States of America
 *         country_population: 278357000
 */
import InputModel from './InputModel.js';

/**
 * Details about a country or goverment
 */
export default class CountryUpdateModel extends InputModel {
  //country_code;
  //country_code2;
  //country_name;
  //continent
  //country_capital;
  //country_population;
  
  /**
   * Creates an instance of the CountryUpdateModel class.
   * @param {String} country_code TThe ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported
   * @param {Object} properties The properties for the update
   */
  constructor(country_code, properties) {
    super(properties);
    this.key = {
      country_code: country_code
    };
  }

  /**
   * Creates an instance of the CountryUpdateModel class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {CountryUpdateModel} The configured input model.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new CountryUpdateModel(req.params.code || req.params.country_code, 
                                    req.body);
    }
    return new CountryUpdateModel();
  }

  /**
   * Checks to see if the data is valid.
   * @returns {Boolean} True if valid, false if otherwise.
   */
  isValid() {
    return this.country_code ||
           this.country_name || 
           this.continent;
  }
}