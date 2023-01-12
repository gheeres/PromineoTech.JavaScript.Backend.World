/**
 * A base class for common inheritance.
 */
export default class Model {
  /**
   * Creates an instance of the Filter class.
   * @param {Object} properties The properties for the update
   */
  constructor(properties) {
    if (properties) {
      Object.assign(this, properties || {});
    }
  }

  /**
   * Returns the string representation of the object.
   * @returns {String} The string representation of the object.
   */
  toString() {
    return JSON.stringify(this);
  }
};