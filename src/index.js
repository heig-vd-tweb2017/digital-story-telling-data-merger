const Papa = require('papaparse');
const fs = require('fs');

const input = 'food.csv';

const redMeat = ['Bovine Meat', 'Fats, Animals, Raw', 'Meat', 'Meat, Other', 'Mutton & Goat Meat', 'Offals, Edible'];
const whiteMeat = ['Pigmeat', 'Poultry Meat'];
const waterMeat = ['Freshwater Fish', 'Fish, Seafood', 'Aquatic Animals, Other', 'Demersal Fish', 'Marine Fish, Other', 'Pelagic Fish', 'Molluscs, Other', 'Crustaceans', 'Cephalopods'];

const tonnes = 'Food supply quantity (tonnes)';
const kgPerPersonPerYear = 'Food supply quantity (kg/capita/yr)';

const meatCategories = [...redMeat, ...whiteMeat, ...waterMeat];

const countries = new Map();

const content = fs.readFileSync(input, { encoding: 'utf8' });

Papa.parse(content, {
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

        if (countries.has(countryName)) {
          country = countries.get(countryName);
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
        countries.set(countryName, country);
      }
    }
  },
  complete() {
    // Store every country in MongoDB
    countries.forEach((value, key) => {
      const yearsArray = Array.from(value.years);

      const countryJson = JSON.stringify({
        name: key,
        years: yearsArray,
      });

      console.log(countryJson);

      // Store in MongoDB
      // TODO
    });

    console.log('All done!');
  },
});
