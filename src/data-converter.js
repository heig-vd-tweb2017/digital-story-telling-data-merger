const Papa = require('papaparse');
const fs = require('fs');

const foodData = 'src/food.csv';
const countriesData = 'src/countries.geo.json';
const output = 'output.geo.json';

const redMeat = ['Bovine Meat', 'Fats, Animals, Raw', 'Meat', 'Meat, Other', 'Mutton & Goat Meat', 'Offals, Edible'];
const whiteMeat = ['Pigmeat', 'Poultry Meat'];
const waterMeat = ['Freshwater Fish', 'Fish, Seafood', 'Aquatic Animals, Other', 'Demersal Fish', 'Marine Fish, Other', 'Pelagic Fish', 'Molluscs, Other', 'Crustaceans', 'Cephalopods'];

const tonnes = 'Food supply quantity (tonnes)';
const kgPerPersonPerYear = 'Food supply quantity (kg/capita/yr)';

const meatCategories = [...redMeat, ...whiteMeat, ...waterMeat];

const foodByCountries = new Map();

const foodContent = fs.readFileSync(foodData, { encoding: 'utf8' });

Papa.parse(foodContent, {
  header: true,
  dynamicTyping: true,
  step: (row) => {
    const data = row.data[0];

    const meatCategory = data.Item;
    const countryCode = data['Area Code'];
    const countryName = data.Area;
    const year = data.Year;

    // Check if the current row is some kind of meat
    if (meatCategories.includes(meatCategory)) {
      // Check if the current row is a valid country
      if (countryCode <= 181) {
        let country;

        if (foodByCountries.has(countryName)) {
          country = foodByCountries.get(countryName);
        } else {
          country = {
            years: new Map(),
          };
        }

        let consumptionPerYear;

        if (country.years.has(year)) {
          consumptionPerYear = country.years.get(year);
        } else {
          consumptionPerYear = {
            tonnes: {
              redMeat: 0,
              whiteMeat: 0,
              waterMeat: 0,
            },
            kgPerPersonPerWeek: {
              redMeat: 0,
              whiteMeat: 0,
              waterMeat: 0,
            },
          };
        }

        const quantityPerYear = data.Value;

        // Check what kind of unit it is
        if (data.Element === tonnes) {
          // Check what kind of meat it is
          if (redMeat.includes(meatCategory)) {
            consumptionPerYear.tonnes.redMeat += quantityPerYear;
          } else if (whiteMeat.includes(meatCategory)) {
            consumptionPerYear.tonnes.whiteMeat += quantityPerYear;
          } else if (waterMeat.includes(meatCategory)) {
            consumptionPerYear.tonnes.waterMeat += quantityPerYear;
          }
        } else if (data.Element === kgPerPersonPerYear) {
          // Check what kind of meat it is
          if (redMeat.includes(meatCategory)) {
            consumptionPerYear.kgPerPersonPerWeek.redMeat += quantityPerYear / 52;
          } else if (whiteMeat.includes(meatCategory)) {
            consumptionPerYear.kgPerPersonPerWeek.whiteMeat += quantityPerYear / 52;
          } else if (waterMeat.includes(meatCategory)) {
            consumptionPerYear.kgPerPersonPerWeek.waterMeat += quantityPerYear / 52;
          }
        }

        // Save the year consumption for the country
        country.years.set(year, consumptionPerYear);

        // Save the country
        foodByCountries.set(countryName, country);
      }
    }
  },
  complete() {
    console.log('Food data reworked.');
  },
});


fs.readFile(countriesData, { encoding: 'utf8' }, (err, data) => {
  const countries = JSON.parse(data);

  // Store every country in MongoDB
  foodByCountries.forEach((countryData, country) => {
    const countryGeo = countries.features.find(obj => obj.properties.name === country);

    if (countryGeo != null) {
      countryGeo.properties.years = {};

      countryData.years.forEach((yearData, year) => {
        countryGeo.properties.years[`_${year}`] = yearData;
      });
    }
  });

  console.log('Countries data reworked.');

  const countriesJSONGeo = JSON.stringify(countries);

  fs.writeFileSync(output, countriesJSONGeo);

  console.log('All data processed.');
});
