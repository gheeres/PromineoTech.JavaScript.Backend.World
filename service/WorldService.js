import SqliteRepository from "../repository/SqliteRepository.js";
import CityRepository from "../repository/CityRepository.js";
import CountryRepository from "../repository/CountryRepository.js";
import LanguageRepository from "../repository/LanguageRepository.js";
import Response from "../models/Response.js";
import CityFilter from "../models/filter/CityFilter.js";
import CountryFilter from "../models/filter/CountryFilter.js";
import CityUpdateModel from "../models/input/CityUpdateModel.js";
import CountryUpdateModel from "../models/input/CountryUpdateModel.js";

const TAG = `WorldService`;

/**
 * Business / application layer for getting information 
 * about the countries and cities of the world.
 */
export default class WorldService {
  #countryRepository;
  #cityRepository;
  #languageRepository;

  /**
   * Creates an instance of the WorldService class.
   * @param {CountryRepository} countryRepository The repository/data access layer for getting information about countries.
   * @param {CityRepository} cityRepository The repository/data access layer for getting information about cities.
   * @param {LanguageRepository} languageRepository The repository/data access layer for getting information about languages.
   */
  constructor(countryRepository, cityRepository, languageRepository) {
    this.#countryRepository = countryRepository || new CountryRepository();
    this.#cityRepository = cityRepository || new CityRepository();
    this.#languageRepository = languageRepository || new LanguageRepository();
  }

  /**
   * Creates the database and populations the initial data.
   */
  async initialize() {
    //console.debug(`${ TAG }.initialize()`);
    
    await this.#countryRepository.initialize();
  }

  /**
   * Retrieves all available countries.
   * @param {CountryFilter} filter The optional filter to apply.
   * @returns {Array.CountryModel} All of the available countries. If nothing found, then an empty array is returned.
   */
  async getCountries(filter) {
    //console.debug(`${ TAG }.getCountries(${ JSON.stringify(filter) })`);

    if (filter) {
      if (filter.country_name) {
        return await this.#countryRepository.find({ ...filter, country_name: `%${ filter.country_name }%` });
      }
      return await this.#countryRepository.find(filter);
    }
    return await this.#countryRepository.all();
  }

  /**
   * Retrieves the country with the specified identity.
   * @returns {CountryModel} The CountryModel if found, otherwise null.
   */
  async getCountry(code) {
    //console.debug(`${ TAG }.getCountry(${ JSON.stringify(code) })`);

    if (code) {
      return await this.#countryRepository.get(code);
    }
    return new Response(400, `Invalid country code specified. Specify a valid ISO3155-1 identifier. Code: ${ JSON.stringify(code) }`);
  }

  /**
   * Retrieves the cities that match the specified filter.
   * @param {CityFilter} filter The optional filter to apply.
   * @returns {Array.CityModel} The city that match the expression. If nothing found, then an empty array is returned.
   */
  async getCities(filter) {
    console.debug(`${ TAG }.getCities(${ JSON.stringify(filter) })`);

    if (filter) {
      if (filter.city_name) {
        return await this.#cityRepository.find({ ...filter, city_name: `%${ filter.city_name }%` });
      }
      if (filter.country_code) {
        return await this.#cityRepository.all(filter.country_code);
      }
    }
    return await this.#cityRepository.all();
  }

  /**
   * Retrieves the city with the specified unique id.
   * @param {String} id The unique id of the city.
   * @returns {CityModel} The city if found, otherwise null.
   */
  async getCity(id) {
    //console.debug(`${ TAG }.getCity(${ JSON.stringify(id) })`);

    if (id) {
      return await this.#cityRepository.get(id);
    }
    return new Response(400, `City id was missing or invalid. Id: ${ JSON.stringify(id) }`);
  }

  /**
   * Updates or modifies the information about the specified city.
   * @param {String} id The unique id of the city.
   * @param {CityUpdateModel} id The information to update or modify for the city.
   * @returns {Response} The reponse containing the updated city if successful.
   */
  async updateCity(id, input) {
    //console.debug(`${ TAG }.updateCity(${ id }, ${ JSON.stringify(input) })`);

    if ((id) && 
        (input) && (input.isValid())) {
      const response = await this.#cityRepository.update(id, input);
      return response;
    }
    return new Response(400, `Failed to modify city (${ id }) due to an invalid request. Data missing or incomplete.`, { input: input });
  }

  /**
   * Adds or creates a new city.
   * @param {CityAddModel} input The information to update or modify for the city.
   * @returns {Response} The reponse containing the added or created city if successful.
   */
  async addCity(input) {
    //console.debug(`${ TAG }.addCity(${ JSON.stringify(input) })`);

    if ((input) && (input.isValid())) {
      const response = await this.#cityRepository.add(input);
      return response;
    }
    return new Response(400, `Failed to add city due to an invalid request. Data missing or incomplete.`, { input: input });
  }  

  /**
   * Deletes the specified city with the specified unique id.
   * @param {String} id The unique id of the city.
   * @returns {Response} The reponse containing the removed city if successful.
   */
  async deleteCity(id) {
    //console.debug(`${ TAG }.deleteCity(${ JSON.stringify(id) })`);

    if (id) {
      const response = await this.#cityRepository.delete(id);
      return response;
    }
    return new Response(400, `City id was missing or invalid. Id: ${ JSON.stringify(id) }`);
  }

  /**
   * Updates or modifies the information about the specified country.
   * @param {String} code The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported.
   * @param {CountryUpdateModel} id The information to update or modify for the country.
   * @returns {Response} The reponse containing the updated country if successful.
   */
  async updateCountry(code, input) {
    //console.debug(`${ TAG }.updateCountry(${ code }, ${ JSON.stringify(input) })`);

    if ((code) && 
        (input) && (input.isValid())) {
      const response = await this.#countryRepository.update(code, input);
      return response;
    }
    return new Response(400, `Failed to modify country (${ code }) due to an invalid request. Data missing or incomplete.`, { input: input });
  }

  /**
   * Adds or creates a new country.
   * @param {CountryAddModel} input The information to update or modify for the country.
   * @returns {Response} The reponse containing the added or created country if successful.
   */
  async addCountry(input) {
    //console.debug(`${ TAG }.addCountry(${ JSON.stringify(input) })`);

    if ((input) && (input.isValid())) {
      const response = await this.#countryRepository.add(input);
      return response;
    }
    return new Response(400, `Failed to add country due to an invalid request. Data missing or incomplete.`, { input: input });
  }  

  /**
   * Deletes the specified country with the specified unique code.
   * @param {String} code The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported.
   * @returns {Response} The reponse containing the removed country if successful.
   */
  async deleteCountry(code) {
    //console.debug(`${ TAG }.deleteCountry(${ JSON.stringify(code) })`);

    if ((code) || (code.length < 2) || (code.length > 3)) {
      const response = await this.#countryRepository.delete(code);
      return response;
    }
    return new Response(400, `County code was missing or invalid. Code: ${ JSON.stringify(code) }`);
  }

  /**
   * Sets or modifies the capital city for a country.
   * @param {String} code The ISO3155-1 identifier of the country. Both alpha-2 and alpha-3 are supported.
   * @param {String} id The unique id of the city to set at the capital.
   * @returns {Response} The reponse containing the updated country information if successful.
   */
  async setCapital(code, id) {
    //console.debug(`${ TAG }.setCapital(${ JSON.stringify(country) },${ JSON.stringify(city) })`);

    const city = await this.#cityRepository.get(id);
    if (city) {
      const country = await this.#countryRepository.get(code);
      if (country) {
        const response = await this.#countryRepository.update(code, new CountryUpdateModel({ country_capital: id }));
        return response;
      }
      return new Response(404, `Specified country (${ code }) was not found. City: ${ JSON.stringify(id) }`, { city: city });
    }
    return new Response(404, `Specified city (${ id }) was not found. Country: ${ JSON.stringify(code) }`);
  }  

  /**
   * Retrieves all available languages.
   * @param {LanguageFilter} filter The optional filter to apply.
   * @returns {Array.LanguageModel} All of the available languages. If nothing found, then an empty array is returned.
   */
  async getLanguages(filter) {
    //console.debug(`${ TAG }.getLanguages(${ JSON.stringify(filter) })`);

    if (filter) {
      if (filter.language_name) {
        return await this.#languageRepository.find({ ...filter, language_name: `%${ filter.language_name }%` });
      }
      return await this.#languageRepository.find(filter);
    }
    return await this.#languageRepository.all();
  }

  /**
   * Retrieves the language with the specified identity.
   * @param {String} code The ISO639-3 identifier of the language.
   * @returns {LanguageModel} The LanguageModel if found, otherwise null.
   */
  async getLanguage(code) {
    //console.debug(`${ TAG }.getLanguage(${ JSON.stringify(code) })`);

    if (code) {
      return await this.#languageRepository.get(code);
    }
    return new Response(400, `Invalid language code specified. Specify a valid ISO639-3 identifier. Code: ${ JSON.stringify(code) }`);
  }

  /**
   * Adds or creates a new language.
   * @param {LanguageAddModel} input The information to update or modify for the language.
   * @returns {Response} The reponse containing the added or created language if successful.
   */
  async addLanguage(input) {
    //console.debug(`${ TAG }.addLanguage(${ JSON.stringify(input) })`);

    if ((input) && (input.isValid())) {
      const response = await this.#languageRepository.add(input);
      return response;
    }
    return new Response(400, `Failed to add language due to an invalid request. Data missing or incomplete.`, { input: input });
  }  

  /**
   * Updates or modifies the information about the specified language.
   * @param {String} code The ISO639-3 identifier of the language.
   * @param {LanguageUpdateModel} id The information to update or modify for the language.
   * @returns {Response} The reponse containing the updated language if successful.
   */
  async updateLanguage(code, input) {
    //console.debug(`${ TAG }.updateLanguage(${ code }, ${ JSON.stringify(input) })`);

    if ((code) && 
        (input) && (input.isValid())) {
      const response = await this.#languageRepository.update(code, input);
      return response;
    }
    return new Response(400, `Failed to modify language (${ code }) due to an invalid request. Data missing or incomplete.`, { input: input });
  }

  /**
   * Deletes the specified language with the specified unique code.
   * @param {String} code The ISO639-3 identifier of the language.
   * @returns {Response} The reponse containing the removed language if successful.
   */
  async deleteLanguage(code) {
    //console.debug(`${ TAG }.deleteLanguage(${ JSON.stringify(code) })`);

    if ((code) || (code.length < 2) || (code.length > 3)) {
      const response = await this.#languageRepository.delete(code);
      return response;
    }
    return new Response(400, `Language code was missing or invalid. Code: ${ JSON.stringify(code) }`);
  }

  /**
   * Retrieves all of the countries that speak the specified language.
   * @param {String} code The ISO639-3 identifier of the language.
   * @returns {Array.CountryLanguageModel} The collection of countries that speak the specified language. If nothing found, then an empty array is returned.
   */
  async getCountriesForLanguage(code) {
    //console.debug(`${ TAG }.getCountriesForLanguage(${ JSON.stringify(code) })`);

    if (code) {
      return await this.#languageRepository.getCountriesForLanguage(code);
    }
    return new Response(400, `Invalid language code specified. Specify a valid ISO639-3 identifier. Code: ${ JSON.stringify(code) }`);
  }  

  /**
   * Retrieves all of the languages that are speoken in the specified country.
   * @param {String} code The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported.
   * @returns {Array.CountryLanguageModel} The collection of languages spoken in the country. If nothing found, then an empty array is returned.
   */
  async getLanguagesForCountry(code) {
    //console.debug(`${ TAG }.getLanguagesForCountry(${ JSON.stringify(code) })`);

    if (code) {
      return await this.#languageRepository.getLanguagesForCountry(code);
    }
    return new Response(400, `Invalid country code specified. Specify a valid ISO3155-1 identifier. Code: ${ JSON.stringify(code) }`);
  }   

  /**
   * Retrieves the language association for a country by the country and language code.
   * @param {String} country The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported.
   * @param {String} language The ISO639-3 identifier of the language.
   * @returns {Array.CountryLanguageModel} The collection of languages spoken in the country. If nothing found, then an empty array is returned.
   */
  async getLanguageForCountry(country, language) {
    //console.debug(`${ TAG }.getLanguageForCountry(${ JSON.stringify(country) }, ${ JSON.stringify(language) })`);

    if (! country) {
      return new Response(400, `Invalid country code specified. Specify a valid ISO3155-1 identifier. Code: ${ JSON.stringify(country) }`);
    }
    if (! language) {
      return new Response(400, `Invalid language code specified. Specify a valid ISO639-3 identifier. Code: ${ JSON.stringify(language) }`);
    }

    return await this.#languageRepository.getLanguageForCountry(country, language);
  }    

  /**
   * Adds or updates language details for a country.
   * @param {String} country The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported.
   * @param {String} language The ISO639-3 identifier of the language.
   * @param {CountryLanguageDetailAddModel} input The information to update or modify for the language.
   * @returns {Response} The reponse containing the added or created language if successful.
   */
  async addOrUpdateLanguageDetail(country, language, input) {
    //console.debug(`${ TAG }.addOrUpdateLanguageDetail(${ JSON.stringify(country) },${ JSON.stringify(language) },${ JSON.stringify(input) })`);

    if (! country) {
      return new Response(400, `Invalid country code specified. Specify a valid ISO3155-1 identifier. Code: ${ JSON.stringify(country) }`);
    }
    if (! language) {
      return new Response(400, `Invalid language code specified. Specify a valid ISO639-3 identifier. Code: ${ JSON.stringify(language) }`);
    }
    if ((! input) || (!input.isValid())) {
      return new Response(400, `Failed to add language due to an invalid request. Data missing or incomplete.`, { input: input });
    }

    const existing = await this.getLanguageForCountry(country, language);
    if (existing) {
      return await this.#languageRepository.updateDetail(country, language, input)
    }


    // Make sure country and language exist...
    const countryModel = await this.getCountry(country);
    if (! countryModel) {
      return new Response(400, `Invalid country code specified. Specify a valid ISO3155-1 identifier. Code: ${ JSON.stringify(country) }`);
    }
    const languageModel = await this.getLanguage(input.language_code);
    if (! languageModel) {
      return new Response(400, `Invalid language code specified. Specify a valid ISO639-3 identifier. Code: ${ JSON.stringify(language) }`);
    }

    const response = await this.#languageRepository.addDetail(country, input);
    return response;
  } 

  /**
   * Deletes or removes language details for a country.
   * @param {String} country The ISO3155-1 identifier. Both alpha-2 and alpha-3 are supported.
   * @param {String} language The ISO639-3 identifier of the language.
   * @returns {Response} The reponse containing the remove language details if successful.
   */
  async deleteLanguageDetail(country, language) {
    //console.debug(`${ TAG }.deleteLanguageDetail(${ JSON.stringify(country) },${ JSON.stringify(language) })`);

    if (! country) {
      return new Response(400, `Invalid country code specified. Specify a valid ISO3155-1 identifier. Code: ${ JSON.stringify(country) }`);
    }
    if (! language) {
      return new Response(400, `Invalid language code specified. Specify a valid ISO639-3 identifier. Code: ${ JSON.stringify(language) }`);
    }

    const existing = await this.getLanguageForCountry(country, language);
    if (existing) {
      return await this.#languageRepository.deleteDetail(country, language)
    }
    return new Response(404, `Specified language (${ language }) details not found for (${ country })`);
  } 
}