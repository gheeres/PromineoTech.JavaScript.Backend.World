/**
 * @swagger
 * components:
 *   schemas:
 *     CityAddModel:
 *       type: object
 *       description: Information about a city for creation or addition
 *       required:
 *         - city_name
 *         - country_code
 *       properties:
 *         city_name:
 *           type: string
 *           description: The name of the city
 *         country_code:
 *           type: string
 *           description: The ISO3155-1 alpha-3 country identifier
 *         latitude:
 *           type: number
 *           description: The angular distance of a place north or south of the earth's equator, or of a celestial object north or south of the celestial equator, usually expressed in degrees and minutes.
 *         longitude:
 *           type: number
 *           description: The angular distance of a place east or west of the meridian at Greenwich, England, or west of the standard meridian of a celestial object, usually expressed in degrees and minutes.
 *         city_population:
 *           type: integer
 *           format: int64
 *           minimum: 0
 *           description: The recorded population of the city
 *       example:
 *         city_name: Washington
 *         country_code: USA
 *         latitude: 38.904700
 *         longitude: -77.016300
 *         city_population: 5379184
 */
import InputModel from './InputModel.js';

/**
 * Details about a city or area of population concentation
 */
export default class CityAddModel extends InputModel {
  //city_name;
  //country_code;
  //latitude;
  //longitude;
  //city_population;

  /**
   * Creates an instance of the CityAddModel class.
   * @param {Object} properties The properties for the update
   */
  constructor(properties) {
    super();
    Object.assign(this, properties || {});
  }

  /**
   * Creates an instance of the CityAddModel class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {CityAddModel} The configured input model.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new CityAddModel(req.body);
    }
    return new CityAddModel();
  }

  /**
   * Checks to see if the data is valid.
   * @returns {Boolean} True if valid, false if otherwise.
   */
  isValid() {
    return (this.country_code?.trim() !== '') &&
           (this.city_name?.trim() !== '');
  }
}