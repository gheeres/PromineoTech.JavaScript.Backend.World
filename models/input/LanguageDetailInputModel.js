/**
 * @swagger
 * components:
 *   schemas:
 *     LanguageDetailInputModel:
 *       type: object
 *       description: Information about the relationship between a country and a spoken language.
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
import InputModel from './InputModel.js';

/**
 * Details about a language
 */
export default class LanguageDetailInputModel extends InputModel {
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
   * Creates an instance of the LanguageDetailInputModel class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {LanguageDetailInputModel} The configured input model.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new LanguageDetailInputModel(req.body);
    }
    return new LanguageDetailInputModel();
  }

  /**
   * Checks to see if the data is valid.
   * @returns {Boolean} True if valid, false if otherwise.
   */
  isValid() {
    return true;
  }
}