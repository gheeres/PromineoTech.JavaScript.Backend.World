/**
 * @swagger
 * components:
 *   schemas:
 *     CountryLanguageDetailAddModel:
 *       type: object
 *       description: Information about the relationship between a country and a spoken language.
 *       required:
 *         - language_code
 *       properties:
 *         language_code:
 *           type: string
 *           description: The ISO639-3 language identifier
 *         is_official:
 *           type: boolean
 *           description: Indicates if the specified language is the officially recognized language of the country
 *         language_percentage:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: The percentage of the population that speaks the specified language.
 *       example:
 *         language_code: ENG
 *         is_official: true
 *         language_percentage: 86.2
 */
import LanguageDetailInputModel from './LanguageDetailInputModel.js';

/**
 * Details about a language
 */
export default class CountryLanguageDetailAddModel extends LanguageDetailInputModel {
  //language_code;
  //is_official;
  //language_percentage;

  /**
   * Creates an instance of the CountryLanguageDetailAddModel class.
   * @param {Object} properties The properties for the update
   */
  constructor(properties) {
    super();
    Object.assign(this, properties || {});
  }

  /**
   * Creates an instance of the CountryLanguageDetailAddModel class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {CountryLanguageDetailAddModel} The configured input model.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new CountryLanguageDetailAddModel(req.body);
    }
    return new CountryLanguageDetailAddModel();
  }

  /**
   * Checks to see if the data is valid.
   * @returns {Boolean} True if valid, false if otherwise.
   */
  isValid() {
    return super.isValid() &&
           (this.language_code?.trim() !== '');
  }
}