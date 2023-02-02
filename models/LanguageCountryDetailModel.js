/**
 * @swagger
 * components:
 *   schemas:
 *     LanguageCountryDetailModel:
 *       type: object
 *       description: Details about a country and a language
 *       required:
 *         - country
 *       properties:
 *         country:
 *           description: The country
 *           $ref: '#/components/schemas/CountryBaseModel'
 *         is_official:
 *           type: boolean
 *           description: Indicates if the specified language is the officially recognized language of the country
 *         language_percentage:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: The percentage of the population that speaks the specified language.
 *       example:
 *         country: 
 *           country_code: USA
 *           country_name: United States of America
 *         is_official: true
 *         language_percentage: 86.2
 */
import LanguageDetailModel from './LanguageDetailModel.js'
import CountryBaseModel from './CountryBaseModel.js';

/**
 * Details about the percentage of a particular language spoken in a country
 */
export default class LanguageCountryDetailModel extends LanguageDetailModel {
  //country;
  //is_official;
  //language_percentage;

  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `${ this.country?.toString() } - ${ super.toString() }`;
  }
}