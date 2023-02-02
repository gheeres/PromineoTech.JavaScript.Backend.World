/**
 * @swagger
 * components:
 *   schemas:
 *     CountryLanguageDetailModel:
 *       type: object
 *       description: Details about a country and a language
 *       required:
 *         - language
 *       properties:
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
 *         language: 
 *           language_code: ENG
 *           language_name: English
 *         is_official: true
 *         language_percentage: 86.2
 */
import LanguageDetailModel from './LanguageDetailModel.js';
import LanguageBaseModel from './LanguageBaseModel.js';

/**
 * Details about the percentage of a particular language spoken in a country
 */
export default class CountryLanguageModel extends LanguageDetailModel {
  //language;
  //is_official;
  //language_percentage;

  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `${ this.language?.toString() } - ${ super.toString() }`;
  }
}