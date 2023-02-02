/**
 * @swagger
 * components:
 *   schemas:
 *     LanguageAddModel:
 *       type: object
 *       description: Information about a language for creation or addition
 *       required:
 *         - language_code
 *         - language_name
 *       properties:
 *         language_code:
 *           type: string
 *           description: The ISO639-3 language identifier
 *         language_code2:
 *           type: string
 *           description: The ISO639-2 language identifier
 *         language_name:
 *           type: string
 *           description: The official name of the language
 *         language_notes:
 *           type: string
 *           description: Optional notes or additional information regarding the language
 *       example:
 *         language_code: ENG
 *         language_code2: EN
 *         language_name: English
 *         language_notes: 
 */
import InputModel from './InputModel.js';

/**
 * Details about a language
 */
export default class LanguageAddModel extends InputModel {
  //language_code;
  //language_code2;
  //language_name;
  //language_notes;

  /**
   * Creates an instance of the LanguageAddModel class.
   * @param {Object} properties The properties for the update
   */
  constructor(properties) {
    super();
    Object.assign(this, properties || {});
  }

  /**
   * Creates an instance of the LanguageAddModel class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {LanguageAddModel} The configured input model.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new LanguageAddModel(req.body);
    }
    return new LanguageAddModel();
  }

  /**
   * Checks to see if the data is valid.
   * @returns {Boolean} True if valid, false if otherwise.
   */
  isValid() {
    return (this.language_code?.trim() !== '') &&
           (this.language_name?.trim() !== '');
  }
}