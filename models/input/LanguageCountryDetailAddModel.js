/**
 * @swagger
 * components:
 *   schemas:
 *     LanguageCountryDetailAddModel:
 *       type: object
 *       description: Information about the relationship between a country and a spoken language.
 *       required:
 *         - country_code
 *       properties:
 *         country_code:
 *           type: string
 *           description: The ISO3155-1 alpha-3 country identifier
 *         is_official:
 *           type: boolean
 *           description: Indicates if the specified language is the officially recognized language of the country
 *         language_percentage:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: The percentage of the population that speaks the specified language.
 *       example:
 *         country_code: USA
 *         is_official: true
 *         language_percentage: 86.2
 */
import LanguageDetailInputModel from './LanguageDetailInputModel.js';

/**
 * Details about a language
 */
export default class LanguageCountryDetailAddModel extends LanguageDetailInputModel {
  //country_code;
  //is_official;
  //language_percentage;

  /**
   * Creates an instance of the LanguageCountryDetailAddModel class.
   * @param {Object} properties The properties for the update
   */
  constructor(properties) {
    super();
    Object.assign(this, properties || {});
  }

  /**
   * Creates an instance of the CountryLanguageDetailAddModel class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {LanguageCountryDetailAddModel} The configured input model.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new LanguageCountryDetailAddModel(req.body);
    }
    return new LanguageCountryDetailAddModel();
  }

  /**
   * Checks to see if the data is valid.
   * @returns {Boolean} True if valid, false if otherwise.
   */
  isValid() {
    return super.isValid() &&
           (this.country_code?.trim() !== '');
  }
}