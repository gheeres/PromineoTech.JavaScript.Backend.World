import Model from "../Model.js";

/**
 * A base class for input models.
 */
export default class InputModel extends Model {
  /**
   * Creates an instance of the CityBaseModel class.
   * @param {Object} properties The properties for the update
   */
  constructor(properties) {
    super(properties);
  }

  /**
   * Checks to see if the specified propery is set.
   * @param {String} name The name of the property to check.
   * @returns {Boolean} True if set, false if otherwise.
   */
  isPropertySet(name) {
    return typeof(this[name]) !== 'undefined';
  }
};