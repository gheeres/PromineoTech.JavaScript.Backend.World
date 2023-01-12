/**
 * @swagger
 * components:
 *   schemas:
 *     CityModel:
 *       type: object
 *       description: Details about a city or area of population concentation
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
 *         country:
 *           description: The country that the city is a member of
 *           $ref: '#/components/schemas/CountryBaseModel'
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
 *         city_id: 8321
 *         city_name: Washington
 *         country:
 *           country_code: USA
 *           country_name: United States of America
 *         latitude: 38.904700
 *         longitude: -77.016300
 *         city_population: 5379184
 */
import CityBaseModel from './CityBaseModel.js';

/**
 * Details about a city or area of population concentation
 */
export default class CityModel extends CityBaseModel {
  //country;
  //latitude;
  //longitude;
  //city_population;

  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `${ this.city_name } (${ this.city_id }): [lat/long: ${ this.latitude }/${ this.longitude }]`;
  }
}