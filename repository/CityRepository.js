import SqliteRepository from './SqliteRepository.js';
import Response from '../models/Response.js';
import CityModel from '../models/CityModel.js';
import CityFilter from '../models/filter/CityFilter.js';
import CityAddModel from '../models/input/CityAddModel.js';
import CityUpdateModel from '../models/input/CityUpdateModel.js';
import CountryBaseModel from '../models/CountryBaseModel.js';

const TAG = `CityRepository`;
const defaultCountry = 'USA';

/**
 * Data access layer for cities of the world.
 */
export default class CityRepository extends SqliteRepository {
  /**
   * Creates an instance of the CityRepository class.
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
        city.city_id, 
        city.country_code,
        country.country_name,
        city.city_name, 
        city.latitude, 
        city.longitude, 
        city.city_population
      FROM 
        city
        LEFT JOIN country 
        ON country.country_code = city.country_code
      ${ (where) ? ` WHERE ${ where }` : '' }
      ORDER BY
        city.city_name
      ;
    `;
  }

  /**
   * Converts a database row into an instance of CityModel.
   * @param {Object} row The current database row to serialize
   * @param {CityModel} prev The previously serialized instance.
   * @param {Number} index The current row number
   * @returns The CityModel instance.
   */
  #toCityModel(row,prev,index) {
    //console.debug(`${ TAG }.#toCityModel(${ JSON.stringify(row) }, ${ JSON.stringify(prev) },${ JSON.stringify(index) })`);

    const city = new CityModel();
    const { country_code, country_name, ...data } = row;
    Object.assign(city, { ...data, country: new CountryBaseModel(country_code, country_name) });
    return city;
  }

  /**
   * Searches for any cities that contain all or part of the name.
   * @param {CityFilter} filter The regular expression search.
   * @returns {CityModel} The cities that match the expression. If nothing found, then an empty array is returned.
   */
  async find(filter) {
    //console.debug(`${ TAG }.find(${ JSON.stringify(params) })`);

    const query = [];
    const params = {};
    if (filter.country_code) {
      query.push(`city.country_code IN (SELECT country_code 
                                        FROM country
                                        WHERE country_code = $country_code
                                           OR country_code2 = $country_code)`);
      params.$country_code = filter.country_code;
    }
    if (filter.isCapital) {
      query.push(`city.city_id IN (SELECT DISTINCT country_capital FROM country)`);
    }
    if (filter.city_name) {
      let operator = '=';
      if (/[_%]/g.test(filter.city_name)) {
        operator = 'LIKE';
      }
      query.push(`city.city_name ${ operator } $name`)
      params.$name = filter.city_name;
    }

    if (query.length) {
      const sql = this.#getDefaultSQLQueryString(query.join(' AND '));
      const results = await this.query(sql, params, this.#toCityModel);
      return results || [];
    }
    return [];
  }

  /**
   * Retrieves the city with the specified unique id.
   * @param {String} id The unique id of the city.
   * @returns {CityModel} The city if found, otherwise null.
   */
  async get(id) {
    //console.debug(`${ TAG }.get(${ JSON.stringify(id) })`);

    if (id) {
      const filter = `city.city_id = $city_id`;
      const sql = this.#getDefaultSQLQueryString(filter);
      const results = await this.query(sql, { $city_id: id }, this.#toCityModel);
      return results ? results[0] : null;
    }
    return null;
  }

  /**
   * Retrieves all available cities for a particular country.
   * @param {String} code The unique id of the country.
   * @returns {Array.CityModel} The cities if any, otherwise and empty array.
   */
  async all(code) {
    //console.debug(`${ TAG }.all(${ JSON.stringify(code) })`);

    if (code) {
      const filter = `(city.country_code = $country_code OR country.country_code2 = $country_code)`;
      const sql = this.#getDefaultSQLQueryString(filter);
      const results = await this.query(sql, { $country_code : code }, this.#toCityModel);
      return results || [];
    }
    return [];
  }

  /**
   * Deletes or removes the specified city.
   * @param {Integer} id The unique id of the city.
   * @returns {Response} The status of the response containing the removed city if successful.
   */
  async delete(id) {
    //console.debug(`${ TAG }.delete(${ JSON.stringify(id) })`);

    const existing = await this.get(id);
    if (existing) {
      const sql = `
        UPDATE country SET country_capital = NULL WHERE country_capital = $city_id;
        DELETE FROM city WHERE city_id = $city_id;
      `;
      try {
        await this.execute(sql, { $city_id: existing.city_id });

        return new Response(200, `City removed. (${ existing.city_id }) ${ existing.city_name }`, existing);
      } catch(e) {
        return new Response(500, `Failed to remove city '(${ existing.city_id }) ${ existing.city_name }' due to an unhandled error.`, { error: e });
      }
    }
    return new Response(404, new Response(404, `Requested city (${ id }) was not found.`));
  }

  /**
   * Creates or adds the specified city.
   * @param {CityAddModel} input The new city information.
   * @returns {Response} The status of the response containing the added city if successful.
   */
  async add(input) {
    //console.debug(`${ TAG }.add(${ JSON.stringify(input) })`);

    if (input && input.isValid()) {
      const sql = `
        INSERT INTO city (country_code,city_name,latitude,longitude,city_population)
        VALUES ((SELECT country_code FROM country WHERE country_code = $country_code OR country_code2 = $country_code), 
                $city_name,$latitude,$longitude,$city_population);
      `;
      const params = {
        $country_code: input.country_code || defaultCountry,
        $city_name: input.city_name,
        $latitude: input.latitude,
        $longitude: input.longitude,
        $city_population: input.city_population,
      };
      try {
        const result = await this.execute(sql, params);
        if (result) {
          let city_id = 0;
          await this.query("SELECT SEQ from sqlite_sequence WHERE name = 'city';", {}, function(row,prev,index) {
            city_id = row.seq;
          })

          const city = await this.get(city_id);
          if (city) {
            return new Response(200, `City added. (${ city.city_id }) ${ city.city_name }`, city);
          }
          return new Response(404, `City orphaned. Request for city (${ city_id }) failed. Check database integrity.`, { city_id: city_id, input : input });
        }
        return new Response(500, `Failed to add city '(${ input.country_code }) ${ input.city_name }' due to an non-success status code.`);
      } catch(e) {
        return new Response(500, `Failed to add city '(${ input.country_code }) ${ input.city_name }' due to an unhandled error.`, { error: e });
      }
    }
    return new Response(400, `Invalid or missing values specified for new city.`, { input: input });
  }

  /**
   * Updates or modifies the specified city.
   * @param {Integer} id The unique id of the city.
   * @param {CityUpdateModel} input The modified city information. Only fields that should be modified should have values set.
   * @returns {Response} The status of the response containing the updated city if successful.
   */
  async update(id, input) {
    //console.debug(`${ TAG }.update(${ id }, ${ JSON.stringify(input) })`);
    
    const existing = await this.get(id);
    if (existing) {
      if (input && input.isValid()) {
        const params = { $city_id: existing.city_id };
        const properties = [];
        if (input.isPropertySet('country_code') && 
           ((existing.country || {}).country_code !== input.country_code)) {
          params.$country_code = input.country_code;
          properties.push(`country_code = (SELECT country_code 
                                           FROM country
                                           WHERE country_code = $country_code OR country_code2 = $country_code)`);
        }
        if (input.isPropertySet('city_name') && 
           (existing.city_name !== input.city_name)) {
          params.$city_name = input.city_name;
          properties.push(`city_name = $city_name`);
        }
        if (input.isPropertySet('latitude') && 
           (existing.latitude !== input.latitude)) {
          params.$latitude = input.latitude;
          properties.push(`latitude = $latitude`);
        }
        if (input.isPropertySet('longitude') && 
           (existing.longitude !== input.longitude)) {
          params.$longitude = input.longitude;
          properties.push(`longitude = $longitude`);
        }
        if (input.isPropertySet('city_population') && 
           (existing.city_population !== input.city_population)) {
          params.$city_population = input.city_population;
          properties.push(`city_population = $city_population`);
        }

        if (properties.length) {
          const sql = `UPDATE city SET ${ properties.join(',') }
                       WHERE city_id = $city_id;`;
          try {
            const result = await this.execute(sql, params);
            if (result) {
              const city = await this.get(existing.city_id);
              if (city) {
                return new Response(200, `City modified. (${ city.city_id }) ${ city.city_name }`, city);
              }
            }
            return new Response(500, `Failed to modify city '(${ existing.city_id }) ${ existing.city_name }' due to an non-success status code.`, { input: input });
          } catch(e) {
            return new Response(500, `Failed to modify city '(${ existing.city_id }) ${ existing.city_name }' due to an unhandled error.`, { input: input, error: e });
          }
        }
        return new Response(304, `No changes detected for city.`, existing);
      }
      return new Response(400, `Failed to modify requested city. Invalid input or missing parameters.`, { input: input, existing: existing });
    }
    return new Response(404, `The requested city (${ id }) was not found.`);
  }  
};