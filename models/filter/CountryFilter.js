/**
 * @swagger
 * components:
 *   schemas:
 *     CountryFilter:
 *       type: object
 *       description: Filter / search options for a country
 *       properties:
 *         continent:
 *           type: string
 *           description: The continent where the country is located. (Asia, Europe, North America, Africa, Oceania, Antarctica, South America)
 *         country_name:
 *           type: string
 *           description: The name or part of the country name.
 */
import Filter from "./Filter.js";

/**
 * Filters / options for city based searches.
 */
export default class CountryFilter extends Filter {
  //country_name;
  //continent;

  /**
   * Creates an instance of the CountryFilter class.
   * @param {String} country_name The name or part of name to search on.
   * @param {String} continent The continent to filter or limit results to
   */
  constructor(country_name, continent) {
    super();
    this.country_name = country_name;
    this.continent = continent;
  }
  
  /**
   * Creates an instance of the CountryFilter class from the HTTP Request
   * @param {Request} req The HTTP message request
   * @returns {CountryFilter} The configured country filter.
   */
  static fromHTTPRequest(req) {
    if (req) {
      return new CountryFilter(req.query.country_name, 
                               req.query.continent);
    }
    return new CountryFilter();
  }  
};