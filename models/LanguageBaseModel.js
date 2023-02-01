/**
 * @swagger
 * components:
 *   schemas:
 *     LanguageBaseModel:
 *       type: object
 *       description: Minimal information about a language or dialect
 *       required:
 *         - language_code
 *         - language_name
 *       properties:
 *         language_code:
 *           type: string
 *           description: The ISO639-3 language identifier
 *         language_name:
 *           type: string
 *           description: The official name of the language
 *       example:
 *         language_code: eng
 *         language_name: English
 */
import Model from './Model.js';

/**
 * Minimal information about a language or govement of the world
 */
export default class LanguageBaseModel extends Model {
  //language_code;
  //language_name;

  /**
   * Creates an instance of the LanguageBaseModel class.
   * @param {String} language_code The ISO639-3 language identifier
   * @param {String} language_name The official name of the language
   */
  constructor(language_code, language_name) {
    super();
    this.language_code = language_code;
    this.language_name = language_name;
  }  
  
  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `[${ this.language_code }] ${ this.language_name }`;
  }
}