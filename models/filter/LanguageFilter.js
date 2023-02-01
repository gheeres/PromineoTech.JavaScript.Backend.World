/**
 * @swagger
 * components:
 *   schemas:
 *     LanguageFilter:
 *       type: object
 *       description: Filter / search options for a language
 *       properties:
 *         language_name:
 *           type: string
 *           description: The name or part of the language name.
 */
import Filter from "./Filter.js";

/**
 * Filters / options for language based searches.
 */
export default class LanguageFilter extends Filter {
  //language_name;

  /**
   * Creates an instance of the LanguageFilter class.
   * @param {String} language_name The name or part of name to search on.
   */
  constructor(language_name) {
    super();
    this.language_name = language_name;
  }
  
  /**
   * Creates an instance of the LanguageFilter class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {LanguageFilter} The configured language filter.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new LanguageFilter(req.query.language_name);
    }
    return new LanguageFilter();
  }  
};