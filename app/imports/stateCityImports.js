const axios = require('axios');
const CountryCode = require('../models').country_codes;
const State = require('../models').states;
const City = require('../models').cities;

async function stateCityImports() {
  // Fetch the JSON data from the GitHub URL
  const url =
    'https://github.com/dr5hn/countries-states-cities-database/raw/refs/heads/master/countries+states+cities.json';

  try {
    // Make a GET request to the URL to get the JSON data
    const response = await axios.get(url);
    const countryList = response.data;

    // Fetch country codes from your database
    const countryCode = await CountryCode.findAll();

    // Loop through each country and find corresponding states
    for (let country of countryCode) {
      const countryData = countryList.find((c) => c.iso2 === country.shortName);
      if (countryData && countryData.states) {
        for (let state of countryData.states) {
          const stateInserted = await State.create({
            name: state.name,
            countryId: country.id
          });
          // for (let city of state.cities) {
          //   await City.create({
          //     name: city.name,
          //     stateId: stateInserted.id
          //   });
          // }
          let cities = await state.cities.map((city) => {
            return {
              name: city.name,
              stateId: stateInserted.id
            };
          });
          await City.bulkCreate(cities);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching data from URL:', error);
  }
}

stateCityImports();
