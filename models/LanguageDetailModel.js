/**
 * @swagger
 * components:
 *   schemas:
 *     LanguageDetailModel:
 *       type: object
 *       description: Details about a particular langage spoken in a particular country.
 *       properties:
 *         is_official:
 *           type: boolean
 *           description: Indicates if the specified language is the officially recognized language of the country
 *         language_percentage:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: The percentage of the population that speaks the specified language.
 *       example:
 *         is_official: true
 *         language_percentage: 86.2
 */
import Model from './Model.js';

/**
 * Details about the percentage of a particular language spoken in a country
 */
export default class LanguageDetailModel extends Model {
  //is_official;
  //language_percentage;

  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `${ this.language_percentage?.toFixed(2) } ${ this.is_official ? '*' : '' }`;
  }
}