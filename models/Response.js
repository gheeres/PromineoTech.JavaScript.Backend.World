/**
 * @swagger
 * components:
 *   schemas:
 *     Response:
 *       type: object
 *       description: Represents a response from an endpoint or service call containing status information.
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: Integer
 *           format: int32
 *           description: The numeric status code
 *         message:
 *           type: string
 *           description: The optional text description associated with the response
 *         data:
 *           type: object
 *           description: The encapsulated data
 */
import Model from './Model.js';

/**
 * Represents a response from an endpoint or service call containing
 * status information.
 */
export default class Response extends Model {
  //code;
  //message;
  //data;

  /**
   * Creates an instance of the Response class.
   * @param {Integer} code The numeric status code.
   * @param {String} message An optional text message for the response.
   * @param {Object} data The data contained within the response.
   */
  constructor(code, message, data) {
    super();
    this.code = code;
    this.message = message;
    this.data = data;
  }

  /**
   * Returns true if the contained response indicates a successful condition, otherwise returns false.
   * @param {Array.Integer} codes Optional list of additional codes to consider as a success.
   * @returns {Boolean} True if a successful status, false if otherwise.
   */
  isSuccessStatusCode(codes) {
    return ((this.code >= 200) && (this.code < 300)) ||
            (codes || []).some(c => c === this.code);
  }

  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return `[${ this.code } ] ${ this.message } - Data: ${ JSON.stringify(this.data) }`
  }
}