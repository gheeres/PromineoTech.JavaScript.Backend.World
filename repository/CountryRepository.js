import SqliteRepository from './SqliteRepository.js';
import Response from '../models/Response.js';
import CountryFilter from '../models/filter/CountryFilter.js';
import CountryModel from '../models/CountryModel.js';
import CityBaseModel from '../models/CityBaseModel.js';

const TAG = `CountryRepository`;

/**
 * Data access layer for countries of the world.
 */
export default class CountryRepository extends SqliteRepository {
  /**
   * Creates an instance of the CountryRepository class.
   * @param {String} url The connection string for the database.
   */
  constructor(url) {
    super(url);
  }

  /**
   * Get's the default SQL query string.
   * @param {String} where The optional where clause to merge into the query.
   * @returns {String} The SQL query string.
   */
  #getDefaultSQLQueryString(where) {
    //console.debug(`${ TAG }.#getDefaultSQLQueryString(${ where })`);

    return `
      SELECT 
        country.country_code, 
        country.country_code2, 
        country.country_name, 
        country.continent,
        country.country_capital capital_id,
        city.city_name capital_name,
        country.country_population
      FROM 
        country
        LEFT JOIN city
        ON country.country_capital = city.city_id
      ${ (where) ? ` WHERE ${ where }` : '' }
      ORDER BY
        country.country_name
    `;
  }

  /**
   * Converts a database row into an instance of CountryModel.
   * @param {Object} row The current database row to serialize
   * @param {CountryModel} prev The previously serialized instance.
   * @param {Number} index The current row number
   * @returns The CountryModel instance.
   */
  #toCountryModel(row,prev,index) {
    //console.debug(`${ TAG }.#toCountryModel(${ JSON.stringify(row) }, ${ JSON.stringify(prev) },${ JSON.stringify(index) })`);

    const country = new CountryModel();
    const { capital_id, capital_name, ...data } = row;
    Object.assign(country, { ...data, capital: new CityBaseModel(capital_id, capital_name) });
    return country;
  }

  /**
   * Retrieves all available countries.
   * @returns {CountryModel} All of the available countries. If nothing found, then an empty array is returned.
   */
  async all() {
    //console.debug(`${ TAG }.all()`);

    const sql = this.#getDefaultSQLQueryString();
    const results = await this.query(sql, this.#toCountryModel);
    return results || [];
  }

  /**
   * Searches for any countries that contain all or part of the name.
   * @param {CountryFilter} filter The search filter / expression.
   * @returns {CountryModel} The countries that match the expression. If nothing found, then an empty array is returned.
   */
  async find(filter) {
    //console.debug(`${ TAG }.find(${ JSON.stringify(name) })`);

    if (filter) {
      const query = [];
      const params = {};
      if (filter.country_name) {
        let operator = '=';
        if (/[_%]/g.test(filter.country_name)) {
          operator = 'LIKE';
        }
        query.push(`country.country_name ${ operator } $name`)
        params.$name = filter.country_name;
      }
      if (filter.continent) {
        query.push(`country.continent = $continent`)
        params.$continent = filter.continent;
      }

      const sql = this.#getDefaultSQLQueryString(query.join(' AND '));
      const results = await this.query(sql, params, this.#toCountryModel);
      return results || [];
    }
    return [];
  }

  /**
   * Retrieves the cities for the specified country.
   * @param {String} code The unique id of the country.
   * @returns {CountryModel} The country that match the expression. If nothing found, then an empty array is returned.
   */
  async get(code) {
    //console.debug(`${ TAG }.get(${ JSON.stringify(code) })`);

    if (code) {
      const filter = `(country.country_code = $country_code OR country.country_code2 = $country_code)`;
      const sql = this.#getDefaultSQLQueryString(filter);
      const results = await this.query(sql, { $country_code: code }, this.#toCountryModel);
      return results ? results[0] : null;
    }
    return null;
  }

  /**
   * Deletes or removes the specified country.
   * @param {String} code The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported
   * @returns {Response} The status of the response containing the removed country if successful.
   */
  async delete(code) {
    //console.debug(`${ TAG }.delete(${ JSON.stringify(code) })`);

    const existing = await this.get(code);
    if (existing) {
      const sql = `
        UPDATE city SET country_code = NULL WHERE country_code = (SELECT country_code FROM country 
                                                                  WHERE country_code = $country_code 
                                                                     OR country_code2 = $country_code);
        DELETE FROM country_language WHERE country_code = (SELECT country_code FROM country 
                                                           WHERE country_code = $country_code 
                                                              OR country_code2 = $country_code);
        DELETE FROM country 
        WHERE country_code = $country_code 
           OR country_code2 = $country_code;
      `;
      try {
        await this.execute(sql, { $country_code: existing.country_code });

        return new Response(200, `Country removed. (${ existing.country_code }) ${ existing.country_name }`, existing);
      } catch(e) {
        return new Response(500, `Failed to remove country '(${ existing.country_code }) ${ existing.country_name }' due to an unhandled error.`, { error: e });
      }
    }
    return new Response(404, new Response(404, `Requested country (${ code }) was not found.`));
  }

  /**
   * Creates or adds the specified country.
   * @param {CountryAddModel} input The new country information.
   * @returns {Response} The status of the response containing the added country if successful.
   */
  async add(input) {
    //console.debug(`${ TAG }.add(${ JSON.stringify(input) })`);

    if (input && input.isValid()) {
      const sql = `
        INSERT INTO country (country_code,country_code2,country_name,continent,country_capital,country_population)
        VALUES ($country_code,$country_code2,
                $country_name,$continent,$country_capital,$country_population);
      `;
      const params = {
        $country_code: input.country_code,
        $country_code2: input.country_code2,
        $country_name: input.country_name,
        $continent: input.continent,
        $country_capital: input.country_capital,
        $country_population: input.country_population,
      };
      try {
        const result = await this.execute(sql, params);
        if (result) {
          const country = await this.get(input.country_code);
          if (country) {
            return new Response(200, `Country added. (${ country.country_code }) ${ country.country_name }`, country);
          }
          return new Response(404, `Country orphaned. Request for country (${ country_code }) failed. Check database integrity.`, { country_code: country_code, input : input });
        }
        return new Response(500, `Failed to add country '(${ input.country_code }) ${ input.country_name }' due to an non-success status code.`);
      } catch(e) {
        return new Response(500, `Failed to add country '(${ input.country_code }) ${ input.country_name }' due to an unhandled error.`, { error: e });
      }
    }
    return new Response(400, `Invalid or missing values specified for new country.`, { input: input });
  }

  /**
   * Updates or modifies the specified country.
   * @param {String} code The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported
   * @param {CountryUpdateModel} input The modified country information. Only fields that should be modified should have values set.
   * @returns {Response} The status of the response containing the updated country if successful.
   */
  async update(code, input) {
    //console.debug(`${ TAG }.update(${ code }, ${ JSON.stringify(input) })`);
    
    const existing = await this.get(code);
    if (existing) {
      if (input && input.isValid()) {
        const params = { $existing_country_code: (input.key || {}).country_code || existing.country_code };
        const properties = [];
        if (input.isPropertySet('country_code') && 
           (existing.country_code !== input.country_code)) {
          params.$country_code = input.country_code;
          properties.push(`country_code = $country_code`);
        }
        if (input.isPropertySet('country_code2') && 
           (existing.country_code2 !== input.country_code2)) {
          params.$country_code2 = input.country_code2;
          properties.push(`country_code2 = $country_code2`);
        }
        if (input.isPropertySet('country_name') && 
           (existing.country_name !== input.country_name)) {
          params.$country_name = input.country_name;
          properties.push(`country_name = $country_name`);
        }
        if (input.isPropertySet('continent') && 
           (existing.continent !== input.continent)) {
          params.$continent = input.continent;
          properties.push(`continent = $continent`);
        }
        if (input.isPropertySet('country_capital') && 
           ((existing.capital || {}).city_id !== input.country_capital)) {
          params.$country_capital = input.country_capital;
          properties.push(`country_capital = $country_capital`);
        }
        if (input.isPropertySet('country_population') && 
           (existing.country_population !== input.country_population)) {
          params.$country_population = input.country_population;
          properties.push(`country_population = $country_population`);
        }

        if (properties.length) {
          const sql = `UPDATE country SET ${ properties.join(',') }
                       WHERE (country_code = $existing_country_code OR country_code2 = $existing_country_code);`;
          try {
            const result = await this.execute(sql, params);
            if (result) {
              const country = await this.get(input.country_code || existing.country_code);
              if (country) {
                return new Response(200, `Country modified. (${ country.country_code }) ${ country.country_name }`, country);
              }
            }
            return new Response(500, `Failed to modify country '(${ existing.country_code }) ${ existing.country_name }' due to an non-success status code.`, { input: input });
          } catch(e) {
            return new Response(500, `Failed to modify country '(${ existing.country_code }) ${ existing.country_name }' due to an unhandled error.`, { input: input, error: e });
          }
        }
        return new Response(304, `No changes detected for country.`, existing);
      }
      return new Response(400, `Failed to modify requested country. Invalid input or missing parameters.`, { input: input, existing: existing });
    }
    return new Response(404, `The requested country (${ code }) was not found.`);
  }    
};