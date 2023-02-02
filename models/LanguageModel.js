/**
 * @swagger
 * components:
 *   schemas:
 *     LanguageModel:
 *       type: object
 *       description: Details about a language or dialect
 *       required:
 *         - language_code
 *         - language_name
 *       properties:
 *         language_code:
 *           type: string
 *           description: The ISO639-3 language identifier
 *         language_code2:
 *           type: string
 *           description: The ISO639-1 language identifier
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
import LanguageBaseModel from './LanguageBaseModel.js';

/**
 * Details about a language or dialect
 */
export default class LanguageModel extends LanguageBaseModel {
  //language_code;
  //language_code2;
  //language_name;
  //language_notes;

  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `[${ this.language_code }] ${ this.language_name }`;
  }
}