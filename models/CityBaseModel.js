/**
 * @swagger
 * components:
 *   schemas:
 *     CityBaseModel:
 *       type: object
 *       description: Minimum information about a city
 *       required:
 *         - city_id
 *         - city_name
 *       properties:
 *         city_id:
 *           type: integer
 *           format: int32
 *           minimum: 0
 *           description: The unique internal id of the city
 *         city_name:
 *           type: string
 *           description: The name of the city
*/
import Model from './Model.js';

/**
 * Minimum information about a city
 */
export default class CityBaseModel extends Model {
  //city_id;
  //city_name;
  
  /**
   * Creates an instance of the CityBaseModel class.
   * @param {Integer} city_id The unique internal id of the city
   * @param {String} city_name The name of the city
   */
  constructor(city_id, city_name) {
    super();
    this.city_id = city_id;
    this.city_name = city_name;
  }

  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `${ this.city_name } (${ this.city_id })`;
  }
}