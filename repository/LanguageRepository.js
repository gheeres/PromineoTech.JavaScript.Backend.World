import SqliteRepository from './SqliteRepository.js';
import Response from '../models/Response.js';
import LanguageFilter from '../models/filter/LanguageFilter.js';
import LanguageModel from '../models/LanguageModel.js';
import LanguageBaseModel from '../models/LanguageBaseModel.js';
import CountryLanguageModel from '../models/CountryLanguageModel.js';

const TAG = `LanguageRepository`;

export default class LanguageRepository extends SqliteRepository {
  /**
   * Creates an instance of the LanguageRepository class.
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
        language.language_code, 
        language.language_code2, 
        language.language_name, 
        language.language_notes
      FROM 
        language
      ${ (where) ? ` WHERE ${ where }` : '' }
      ORDER BY
        language.language_name
    `;
  }

  /**
   * Converts a database row into an instance of LanguageModel.
   * @param {Object} row The current database row to serialize
   * @param {LanguageModel} prev The previously serialized instance.
   * @param {Number} index The current row number
   * @returns The LanguageModel instance.
   */
  #toLanguageModel(row,prev,index) {
    //console.debug(`${ TAG }.#toLanguageModel(${ JSON.stringify(row) }, ${ JSON.stringify(prev) },${ JSON.stringify(index) })`);

    const language = new LanguageModel();
    Object.assign(language, row);
    return language;
  }

  /**
   * Converts a database row into an instance of CountryLanguageModel.
   * @param {Object} row The current database row to serialize
   * @param {LanguageModel} prev The previously serialized instance.
   * @param {Number} index The current row number
   * @returns The LanguageModel instance.
   */
  #toCountryLanguageModel(row,prev,index) {
    //console.debug(`${ TAG }.#toCountryLanguageModel(${ JSON.stringify(row) }, ${ JSON.stringify(prev) },${ JSON.stringify(index) })`);

    const countryLanguage = new CountryLanguageModel();
    const { country_code, country_name, language_code, language_name, ...data } = row;
    Object.assign(countryLanguage, { ...data, country: new CountryBaseModel(country_code, country_name),
                                              language: new LanguageBaseModel(language_code, language_name) });
    return countryLanguage;
  }

  /**
   * Retrieves all available languages.
   * @returns {LanguageModel} All of the available languages. If nothing found, then an empty array is returned.
   */
  async all() {
    //console.debug(`${ TAG }.all()`);

    const sql = this.#getDefaultSQLQueryString();
    const results = await this.query(sql, this.#toLanguageModel);
    return results || [];
  }

  /**
   * Searches for any language that contain all or part of the name.
   * @param {LanguageFilter} filter The search filter / expression.
   * @returns {LanguageModel} The countries that match the expression. If nothing found, then an empty array is returned.
   */
  async find(filter) {
    //console.debug(`${ TAG }.find(${ JSON.stringify(name) })`);

    if (filter) {
      const query = [];
      const params = {};
      if (filter.language_name) {
        let operator = '=';
        if (/[_%]/g.test(filter.language_name)) {
          operator = 'LIKE';
        }
        query.push(`language.language_name ${ operator } $name`)
        params.$name = filter.language_name;
      }

      const sql = this.#getDefaultSQLQueryString(query.join(' AND '));
      const results = await this.query(sql, params, this.#toLanguageModel);
      return results || [];
    }
    return [];
  }

  /**
   * Retrieves the language by the uniqye identifier.
   * @param {String} code The unique id of the language.
   * @returns {CountryLanguage} The language if found. If nothing found, then an empty array is returned.
   */
  async get(code) {
    //console.debug(`${ TAG }.get(${ JSON.stringify(code) })`);

    if (code) {
      const filter = `(language.language_code = $language_code OR language.language_code2 = $language_code)`;
      const sql = this.#getDefaultSQLQueryString(filter);
      const results = await this.query(sql, { $language_code: code }, this.#toLanguageModel);
      return results ? results[0] : null;
    }
    return null;
  }

  /**
   * Retrieves the list of countries that speak the specified language.
   * @param {String} code The unique id of the country.
   * @returns {CountryLanguageModel} The languages for the country. If nothing found, then an empty array is returned.
   */
  async getCountries(code) {
    //console.debug(`${ TAG }.getCountries(${ JSON.stringify(code) })`);

    if (code) {
      const sql = `
        SELECT
          country_language.country_language_id,
          country_language.country_code,
          country.country_name,
          country_language.language_code,
          language.language_name,
          country_language.is_official,
          country_language.language_percentage
        FROM
          country_language
          INNER JOIN country ON country_language.country_code = country.country_code
          INNER JOIN language ON country_language.language_code = language.language_code
        WHERE
          (country_language.language_code = $language_code OR language.language_code2 = $language_code)
      `;
      const results = await this.query(sql, { $language_code: code }, this.#toCountryLanguageModel);
      return results ? results[0] : null;
    }
    return null;
  }

  /**
   * Deletes or removes the specified language.
   * @param {String} code The ISO639-3 identifier.
   * @returns {Response} The status of the response containing the removed language if successful.
   */
  async delete(code) {
    //console.debug(`${ TAG }.delete(${ JSON.stringify(code) })`);

    const existing = await this.get(code);
    if (existing) {
      const sql = `
        DELETE FROM country_language WHERE language_code IN (SELECT language_code
                                                             FROM language 
                                                             WHERE language_code = $language_code 
                                                                OR language_code2 = $language_code);
        DELETE FROM language 
        WHERE language_code = $language_code 
           OR language_code2 = $language_code;
      `;
      try {
        await this.execute(sql, { $language_code: existing.language_code });

        return new Response(200, `Language removed. (${ existing.language_code }) ${ existing.language_name }`, existing);
      } catch(e) {
        return new Response(500, `Failed to remove language '(${ existing.language_code }) ${ existing.language_name }' due to an unhandled error.`, { error: e });
      }
    }
    return new Response(404, new Response(404, `Requested language (${ code }) was not found.`));
  }

  /**
   * Creates or adds the specified language.
   * @param {LanguageAddModel} input The new language information.
   * @returns {Response} The status of the response containing the added language if successful.
   */
  async add(input) {
    //console.debug(`${ TAG }.add(${ JSON.stringify(input) })`);

    if (input && input.isValid()) {
      const sql = `
        INSERT INTO language (language_code,language_code2,language_name,language_notes)
        VALUES ($language_code,$language_code2,
                $language_name,$language_notes);
      `;
      const params = {
        $language_code: input.language_code,
        $language_code2: input.language_code2,
        $language_name: input.language_name,
        $language_notes: input.language_notes,
      };
      try {
        const result = await this.execute(sql, params);
        if (result) {
          const language = await this.get(input.language_code);
          if (language) {
            return new Response(200, `Language added. (${ language.language_code }) ${ language.language_name }`, language);
          }
          return new Response(404, `Language orphaned. Request for language (${ language_code }) failed. Check database integrity.`, { language_code: language_code, input : input });
        }
        return new Response(500, `Failed to add language '(${ input.language_code }) ${ input.language_name }' due to an non-success status code.`);
      } catch(e) {
        return new Response(500, `Failed to add language '(${ input.language_code }) ${ input.language_name }' due to an unhandled error.`, { error: e });
      }
    }
    return new Response(400, `Invalid or missing values specified for new language.`, { input: input });
  }

  /**
   * Updates or modifies the specified language.
   * @param {String} code The ISO639-3 identifier.
   * @param {CountryUpdateModel} input The modified language information. Only fields that should be modified should have values set.
   * @returns {Response} The status of the response containing the updated language if successful.
   */
  async update(code, input) {
    //console.debug(`${ TAG }.update(${ code }, ${ JSON.stringify(input) })`);
    
    const existing = await this.get(code);
    if (existing) {
      if (input && input.isValid()) {
        const params = { $existing_language_code: (input.key || {}).language_code || existing.language_code };
        const properties = [];
        if (input.isPropertySet('language_code') && 
           (existing.language_code !== input.language_code)) {
          params.$language_code = input.language_code;
          properties.push(`language_code = $language_code`);
        }
        if (input.isPropertySet('language_code2') && 
           (existing.language_code2 !== input.language_code2)) {
          params.$language_code2 = input.language_code2;
          properties.push(`language_code2 = $language_code2`);
        }
        if (input.isPropertySet('language_name') && 
           (existing.language_name !== input.language_name)) {
          params.$language_name = input.language_name;
          properties.push(`language_name = $language_name`);
        }
        if (input.isPropertySet('language_notes') && 
           (existing.language_notes !== input.language_notes)) {
          params.$language_notes = input.language_notes;
          properties.push(`language_notes = $language_notes`);
        }

        if (properties.length) {
          const sql = `UPDATE language SET ${ properties.join(',') }
                       WHERE (language_code = $existing_language_code OR language_code2 = $existing_language_code);`;
          try {
            const result = await this.execute(sql, params);
            if (result) {
              const language = await this.get(input.language_code || existing.language_code);
              if (language) {
                return new Response(200, `Language modified. (${ language.language_code }) ${ language.language_name }`, language);
              }
            }
            return new Response(500, `Failed to modify language '(${ existing.language_code }) ${ existing.language_name }' due to an non-success status code.`, { input: input });
          } catch(e) {
            return new Response(500, `Failed to modify language '(${ existing.language_code }) ${ existing.language_name }' due to an unhandled error.`, { input: input, error: e });
          }
        }
        return new Response(304, `No changes detected for language.`, existing);
      }
      return new Response(400, `Failed to modify requested language. Invalid input or missing parameters.`, { input: input, existing: existing });
    }
    return new Response(404, `The requested language (${ code }) was not found.`);
  }    
}