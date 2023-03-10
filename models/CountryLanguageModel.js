/**
 * @swagger
 * components:
 *   schemas:
 *     CountryLanguageModel:
 *       type: object
 *       description: Details about a country and a language
 *       required:
 *         - country
 *         - language
 *       properties:
 *         country:
 *           description: The country
 *           $ref: '#/components/schemas/CountryBaseModel'
 *         language:
 *           description: The language
 *           $ref: '#/components/schemas/LanguageBaseModel'
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
 *         language: 
 *           language_code: ENG
 *           language_name: English
 *         is_official: true
 *         language_percentage: 86.2
 */
import LanguageDetailModel from './LanguageDetailModel.js';
import CountryBaseModel from './CountryBaseModel.js';
import LanguageBaseModel from './LanguageBaseModel.js';

/**
 * Details about the percentage of a particular language spoken in a country
 */
export default class CountryLanguageModel extends LanguageDetailModel {
  //country;
  //language;

  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `${ this.country?.toString() } : ${ this.language?.toString() } - ${ super.toString() }`;
  }
}