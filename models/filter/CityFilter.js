/**
 * @swagger
 * components:
 *   schemas:
 *     CityFilter:
 *       type: object
 *       description: Filter / search options for a city
 *       properties:
 *         country_code:
 *           type: string
 *           description: The optional ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported
 *         city_name:
 *           type: string
 *           description: The name or part of the city name.
 *         isCapital:
 *           type: boolean
 *           description: Indicates that only capital cities should be included.
 */
import Filter from "./Filter.js";

/**
 * Filters / options for city based searches.
 */
export default class CityFilter extends Filter {
  //city_name;
  //country_code;
  //isCapital;

  /**
   * Creates an instance of the CityFilter class.
   * @param {String} city_name The name or part of name to search on.
   * @param {String} country_code The optional ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported
   * @param {Boolean} isCapital Indicates if only capital cities should be returned.
   */
  constructor(city_name, country_code, isCapital) {
    super();
    this.city_name = city_name;
    this.country_code = country_code;
    this.isCapital = isCapital;
  }
  
  /**
   * Creates an instance of the CityFilter class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {CityFilter} The configured city filter.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new CityFilter(req.query.city_name, 
                            req.query.country_code,
                            req.query.isCapital);
    }
    return new CityFilter();
  }
};