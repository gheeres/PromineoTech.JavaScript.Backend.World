import SqliteRepository from './SqliteRepository.js';
import Response from '../models/Response.js';
import LanguageFilter from '../models/filter/LanguageFilter.js';
import LanguageModel from '../models/LanguageModel.js';
import LanguageBaseModel from '../models/LanguageBaseModel.js';
import CountryBaseModel from '../models/CountryBaseModel.js';
import CountryLanguageModel from '../models/CountryLanguageModel.js';
import CountryLanguageDetailModel from '../models/CountryLanguageDetailModel.js';
import LanguageCountryDetailModel from '../models/LanguageCountryDetailModel.js';
import LanguageDetailInputModel from '../models/input/LanguageDetailInputModel.js';

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
   * Get's the default SQL query string to use for getting country / language relationship information.
   * @param {String} where The optional where clause to merge into the query.
   * @param {String} where The optional ordering / sorting of the results.
   * @returns {String} The SQL query string.
   */
  #getCountryLanguageSQLQueryString(where, order) {
    //console.debug(`${ TAG }.#getCountryLanguageSQLQueryString(${ where })`);

    return `
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
      ${ (where) ? ` WHERE ${ where }` : '' }
      ${ (order) ? ` ORDER BY ${ order }` : '' }
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
    const { country_code, country_name, language_code, language_name, is_official, ...data } = row;
    Object.assign(countryLanguage, { ...data, is_official: (is_official === 'T'),
                                     country: new CountryBaseModel(country_code, country_name),
                                     language: new LanguageBaseModel(language_code, language_name) });
    return countryLanguage;
  }

  /**
   * Converts a database row into an instance of CountryLanguageDetailModel.
   * @param {Object} row The current database row to serialize
   * @param {LanguageModel} prev The previously serialized instance.
   * @param {Number} index The current row number
   * @returns The LanguageModel instance.
   */
  #toCountryLanguageDetailModel(row,prev,index) {
    //console.debug(`${ TAG }.#toCountryLanguageDetailModel(${ JSON.stringify(row) }, ${ JSON.stringify(prev) },${ JSON.stringify(index) })`);

    const detail = new CountryLanguageDetailModel();
    const { country_code, country_name, language_code, language_name, is_official, ...data } = row;
    Object.assign(detail, { ...data, is_official: (is_official === 'T'),
                            language: new LanguageBaseModel(language_code, language_name) });
    return detail;
  }

  /**
   * Converts a database row into an instance of LanguageCountryDetailModel.
   * @param {Object} row The current database row to serialize
   * @param {LanguageModel} prev The previously serialized instance.
   * @param {Number} index The current row number
   * @returns The LanguageModel instance.
   */
  #toLanguageCountryDetailModel(row,prev,index) {
    //console.debug(`${ TAG }.#toLanguageCountryDetailModel(${ JSON.stringify(row) }, ${ JSON.stringify(prev) },${ JSON.stringify(index) })`);

    const detail = new LanguageCountryDetailModel();
    const { country_code, country_name, language_code, language_name, is_official, ...data } = row;
    Object.assign(detail, { ...data, is_official: (is_official === 'T'),
                            country: new CountryBaseModel(country_code, country_name) });
    return detail;
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
   * @param {String} code The unique id of the language.
   * @returns {LanguageCountryDetailModel} The countries that speak the specified language. If nothing found, then an empty array is returned.
   */
  async getCountriesForLanguage(code) {
    //console.debug(`${ TAG }.getCountriesForLanguage(${ JSON.stringify(code) })`);

    if (code) {
      const filter = `(country_language.language_code = $language_code OR language.language_code2 = $language_code)`;
      const sql = this.#getCountryLanguageSQLQueryString(filter, "country.country_name");

      const results = await this.query(sql, { $language_code: code }, this.#toLanguageCountryDetailModel);
      return results || [];
    }
    return [];
  }

  /**
   * Retrieves the list of language for a specified country.
   * @param {String} code The unique id of the country.
   * @returns {CountryLanguageDetailModel} The languages for the country. If nothing found, then an empty array is returned.
   */
  async getLanguagesForCountry(code) {
    //console.debug(`${ TAG }.getLanguagesForCountry(${ JSON.stringify(code) })`);

    if (code) {
      const filter = `(country_language.country_code = $country_code OR country.country_code2 = $country_code)`;
      const sql = this.#getCountryLanguageSQLQueryString(filter, "language.language_name");

      const results = await this.query(sql, { $country_code: code }, this.#toCountryLanguageDetailModel);
      return results || [];
    }
    return [];
  }

  /**
   * Retrieves the language association for a country by the country and language code.
   * @param {String} country The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported.
   * @param {String} language The ISO639-3 identifier of the language.
   * @returns {CountryLanguageModel} The languages for the country. If nothing found, then an empty array is returned.
   */
  async getLanguageForCountry(country, language) {
    //console.debug(`${ TAG }.getLanguageForCountry(${ JSON.stringify(country) },${ JSON.stringify(language) })`);

    if ((country) && (language)) {
      const filter = `    (country_language.country_code = $country_code OR country.country_code2 = $country_code)
                      AND (country_language.language_code = $language_code OR language.language_code2 = $language_code)`;
      const sql = this.#getCountryLanguageSQLQueryString(filter);

      const results = await this.query(sql, { $country_code: country, $language_code: language }, 
                                       this.#toCountryLanguageModel);
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

  /**
   * Adds language details for a country.
   * @param {String} country The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported.
   * @param {CountryLanguageDetailAddModel} input The information to update or modify for the language.
   * @returns {Response} The status of the response containing the added language if successful.
   */
  async addDetail(country, input) {
    //console.debug(`${ TAG }.addDetail(${ JSON.stringify(country) },${ JSON.stringify(input) })`);

    if (! country) {
      return new Response(400, `Invalid country code specified. Specify a valid ISO3155-1 identifier. Code: ${ JSON.stringify(country) }`);
    }
    if ((! input) || (!input.isValid())) {
      return new Response(400, `Failed to add language details due to an invalid request. Data missing or incomplete.`, { input: input });
    }

    const sql = `
      INSERT INTO country_language (country_code,language_code,is_official,language_percentage)
      VALUES ((SELECT country_code FROM country WHERE country_code = $country_code OR country_code2 = $country_code),
              (SELECT language_code FROM language WHERE language_code = $language_code OR language_code2 = $language_code),
              $is_official,
              $language_percentage);
    `;
    const params = {
      $country_code: country,
      $language_code: input.language_code,
      $is_official: input.is_official ? 'T' : 'F',
      $language_percentage: input.language_percentage || 0,
    };
    try {
      const result = await this.execute(sql, params);
      if (result) {
        const detail = await this.getLanguageForCountry(country, input.language_code);
        if (detail) {
          return new Response(200, `Language detail added for (${ detail.country?.country_code }) ${ detail.country?.country_name }. (${ detail.language?.language_code }) ${ detail.language?.language_name }`, detail);
        }
        return new Response(404, `Language detail orphaned. Request for language (${ input.language_code }) details for ${ country } failed. Check database integrity.`, { country : country, input : input });
      }
      return new Response(500, `Failed to add language (${ input.language_code }) details for ${ country } due to an non-success status code.`);
    } catch(e) {
      return new Response(500, `Failed to add language (${ input.language_code }) details for ${ country } due to an unhandled error.`, { error: e });
    }
  }

  /**
   * Adds language details for a country.
   * @param {String} country The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported.
   * @param {String} language The ISO639-3 identifier.
   * @param {LanguageDetailInputModel} input The information to update or modify for the language.
   * @returns {Response} The status of the response containing the added language if successful.
   */
  async updateDetail(country, language, input) {
    //console.debug(`${ TAG }.addDetail(${ JSON.stringify(country) },${ JSON.stringify(language) },${ JSON.stringify(input) })`);

    if (! country) {
      return new Response(400, `Invalid country code specified. Specify a valid ISO3155-1 identifier. Code: ${ JSON.stringify(country) }`);
    }
    if (! language) {
      return new Response(400, `Invalid language code specified. Specify a valid ISO639-3 identifier. Code: ${ JSON.stringify(language) }`);
    }
    if ((! input) || (!input.isValid())) {
      return new Response(400, `Failed to modify language details due to an invalid request. Data missing or incomplete.`, { input: input });
    }

    const sql = `
      UPDATE country_language
      SET is_official = $is_official,
          language_percentage = $language_percentage
      WHERE country_code IN (SELECT country_code FROM country WHERE country_code = $country_code OR country_code2 = $country_code)
        AND language_code IN (SELECT language_code FROM language WHERE language_code = $language_code OR language_code2 = $language_code);
    `;
    const params = {
      $country_code: country,
      $language_code: language,
      $is_official: input.is_official ? 'T' : 'F',
      $language_percentage: input.language_percentage || 0
    };
    try {
      const result = await this.execute(sql, params);
      if (result) {
        const detail = await this.getLanguageForCountry(country, language);
        if (detail) {
          return new Response(200, `Language detail modified for (${ detail.country?.country_code }) ${ detail.country?.country_name }. (${ detail.language?.language_code }) ${ detail.language?.language_name }`, detail);
        }
        return new Response(404, `Language detail orphaned. Request for language (${ language }) details for ${ country } failed. Check database integrity.`, { country : country, language: language, input : input });
      }
      return new Response(500, `Failed to modify language (${ language }) details for ${ country } due to an non-success status code.`);
    } catch(e) {
      return new Response(500, `Failed to modify language (${ language }) details for ${ country } due to an unhandled error.`, { error: e });
    }
  }

  /**
   * Deletes or removes language details for a country.
   * @param {String} country The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported.
   * @param {String} language The ISO639-3 identifier.
   * @returns {Response} The status of the response containing the added language if successful.
   */
  async deleteDetail(country, language) {
    //console.debug(`${ TAG }.deleteDetail(${ JSON.stringify(country) },${ JSON.stringify(language) })`);

    if (! country) {
      return new Response(400, `Invalid country code specified. Specify a valid ISO3155-1 identifier. Code: ${ JSON.stringify(country) }`);
    }
    if (! language) {
      return new Response(400, `Invalid language code specified. Specify a valid ISO639-3 identifier. Code: ${ JSON.stringify(language) }`);
    }

    const existing = await this.getLanguageForCountry(country, language);
    if (! existing) {
      return new Response(404, `Language (${ language }) details not found for ${ country }.`);
    }

    const sql = `
      DELETE FROM country_language
      WHERE country_code IN (SELECT country_code FROM country WHERE country_code = $country_code OR country_code2 = $country_code)
        AND language_code IN (SELECT language_code FROM language WHERE language_code = $language_code OR language_code2 = $language_code);
    `;
    const params = {
      $country_code: country,
      $language_code: language
    };
    try {
      const result = await this.execute(sql, params);
      if (result) {
        return new Response(200, `Language detail removed for (${ existing.country?.country_code }) ${ existing.country?.country_name }. (${ existing.language?.language_code }) ${ existing.language?.language_name }`, existing);
      }
      return new Response(500, `Failed to remove language (${ language }) details for ${ country } due to an non-success status code.`);
    } catch(e) {
      return new Response(500, `Failed to remove language (${ language }) details for ${ country } due to an unhandled error.`, { error: e });
    }
  }
}