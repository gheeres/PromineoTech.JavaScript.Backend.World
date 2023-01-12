import WorldService from "../service/WorldService.js";

// Not real unit test, just quick stub testing.

console.log('[Start]');

const service = new WorldService();
await service.initialize();

/**
 * Outputs the CountryModel to the configured output.
 * @param {Array.CountryModel|CountryModel} countries The countries/country to output / display.
 */
function output(countries) {
  if (Array.isArray(countries)) {
    (countries || []).forEach(async (country,index) => {
      console.log(country.toString());
    });
  }
  else {
    console.log(countries.toString());
  }
}

console.log('Outputing all countries...');
let countries = await service.getCountries();
output(countries);
console.log();

console.log('Searching for countries...');
countries = await service.findCountries("United");
output(countries);
console.log();

console.log('Retrieving individual country by code...');
const country = await service.getCountry("USA");
output(country);
console.log();

console.log('[Done]');
