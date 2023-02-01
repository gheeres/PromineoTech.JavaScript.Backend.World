/**
 * @swagger
 * components:
 *   schemas:
 *     LanguageUpdateModel:
 *       type: object
 *       description: Information about a language for modification
 *       properties:
 *         language_code:
 *           type: string
 *           description: The ISO639-3 language identifier
 *         language_code2:
 *           type: string
 *           description: The ISO639-3 language identifier
 *         language_name:
 *           type: string
 *           description: The official name of the language
 *         language_notes:
 *           type: string
 *           description: Optional notes or additional information regarding the language
 *       example:
 *         language_code: eng
 *         language_code2: en
 *         language_name: English
 *         language_notes: 
 */
import InputModel from './InputModel.js';

/**
 * Details about a language or goverment
 */
export default class LanguageUpdateModel extends InputModel {
  //language_code;
  //language_code2;
  //language_name;
  //language_notes;
  
  /**
   * Creates an instance of the LanguageUpdateModel class.
   * @param {String} language_code The ISO639-3 identifier.
   * @param {Object} properties The properties for the update
   */
  constructor(language_code, properties) {
    super(properties);
    this.key = {
      language_code: language_code
    };
  }

  /**
   * Creates an instance of the LanguageUpdateModel class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {LanguageUpdateModel} The configured input model.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new LanguageUpdateModel(req.params.code || req.params.language_code, 
                                    req.body);
    }
    return new LanguageUpdateModel();
  }

  /**
   * Checks to see if the data is valid.
   * @returns {Boolean} True if valid, false if otherwise.
   */
  isValid() {
    return (this.language_code?.trim() !== '') ||
           (this.language_code2?.trim() !== '') ||
           (this.language_name?.trim() !== '') ||
           (this.language_notes?.trim() !== '');
  }
}