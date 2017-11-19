const Papa = require('papaparse');
const fs = require('fs');

const foodData = 'data/food.csv';
const countriesData = 'data/countries.geo.json';
const output = 'data/output.geo.json';

const redMeat = ['Bovine Meat', 'Fats, Animals, Raw', 'Meat', 'Meat, Other', 'Mutton & Goat Meat', 'Offals, Edible'];
const whiteMeat = ['Pigmeat', 'Poultry Meat'];
const waterMeat = ['Freshwater Fish', 'Fish, Seafood', 'Aquatic Animals, Other', 'Demersal Fish', 'Marine Fish, Other', 'Pelagic Fish', 'Molluscs, Other', 'Crustaceans', 'Cephalopods'];

const tonnes = 'Food supply quantity (tonnes)';
const kgPerPersonPerYear = 'Food supply quantity (kg/capita/yr)';

let maxTotal = 0;
let minTotal = Number.MAX_SAFE_INTEGER;

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
      if (true) {
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
              total: 0,
            },
            kgPerPersonPerWeek: {
              redMeat: 0,
              whiteMeat: 0,
              waterMeat: 0,
              total: 0,
            },
          };
        }

        const quantityPerYear = data.Value;

        // Check what kind of unit it is
        if (data.Element === tonnes) {
          consumptionPerYear.tonnes.total += quantityPerYear;

          // Check what kind of meat it is
          if (redMeat.includes(meatCategory)) {
            consumptionPerYear.tonnes.redMeat += quantityPerYear;
          } else if (whiteMeat.includes(meatCategory)) {
            consumptionPerYear.tonnes.whiteMeat += quantityPerYear;
          } else if (waterMeat.includes(meatCategory)) {
            consumptionPerYear.tonnes.waterMeat += quantityPerYear;
          }
        } else if (data.Element === kgPerPersonPerYear) {
          consumptionPerYear.kgPerPersonPerWeek.total += quantityPerYear / 52;

          // Check what kind of meat it is
          if (redMeat.includes(meatCategory)) {
            consumptionPerYear.kgPerPersonPerWeek.redMeat += quantityPerYear / 52;
          } else if (whiteMeat.includes(meatCategory)) {
            consumptionPerYear.kgPerPersonPerWeek.whiteMeat += quantityPerYear / 52;
          } else if (waterMeat.includes(meatCategory)) {
            consumptionPerYear.kgPerPersonPerWeek.waterMeat += quantityPerYear / 52;
          }
        }

        // Update the min max consumption of meat
        if (consumptionPerYear.tonnes.total > maxTotal) {
          maxTotal = consumptionPerYear.tonnes.total;
        }

        if (consumptionPerYear.tonnes.total < minTotal) {
          minTotal = consumptionPerYear.tonnes.total;
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

const countriesNotFound = new Map();

countriesNotFound.set("Bahamas", "The Bahamas");
countriesNotFound.set("Belgium-Luxembourg", "Belgium"); // Warning !
countriesNotFound.set("Belgium-Luxembourg", "Luxembourg"); // Warning !
countriesNotFound.set("Bolivia (Plurinational State of)", "Bolivia");
countriesNotFound.set("Brunei Darussalam", "Brunei");
countriesNotFound.set("China, Hong Kong SAR", "China"); // Warning !
countriesNotFound.set("China, Macao SAR", "China"); // Warning !
countriesNotFound.set("China, mainland", "China"); // Warning !
countriesNotFound.set("China, Taiwan Province of", "Taiwan"); // Warning !
countriesNotFound.set("Congo", "Democratic Republic of the Congo"); // Warning !
countriesNotFound.set("Congo", "Republic of the Congo"); // Warning !
countriesNotFound.set("C�te d'Ivoire", "Ivory Coast");
countriesNotFound.set("Czechia", "Czech Republic");
countriesNotFound.set("Czechoslovakia", "Slovakia"); // Warning !
countriesNotFound.set("Democratic People's Republic of Korea", "South Korea"); // Warning !
countriesNotFound.set("Dominica", "Dominican Republic");
countriesNotFound.set("Ethiopia PDR", "Ethiopia");
countriesNotFound.set("Guinea-Bissau", "Guinea Bissau");
countriesNotFound.set("Iran (Islamic Republic of)", "Iran");
countriesNotFound.set("Lao People's Democratic Republic", "Laos");
countriesNotFound.set("Republic of Korea", "South Korea"); // Warning !
countriesNotFound.set("Republic of Moldova", "Moldova");
countriesNotFound.set("Russian Federation", "Russia");
countriesNotFound.set("Serbia", "Republic of Serbia");
countriesNotFound.set("Sudan (former)", "Sudan");
countriesNotFound.set("The former Yugoslav Republic of Macedonia", "Macedonia");
countriesNotFound.set("Timor-Leste", "East Timor"); // Warning !
countriesNotFound.set("USSR", "Russia");
countriesNotFound.set("Venezuela (Bolivarian Republic of)", "Venezuela"); // Warning !
countriesNotFound.set("Viet Nam", "Vietnam");

fs.readFile(countriesData, { encoding: 'utf8' }, (err, data) => {
  const countries = JSON.parse(data);

  // Merge the data from ONU and the geo.json
  foodByCountries.forEach((countryData, country) => {
    const countryGeo = countries.features.find(obj => obj.properties.name === country);

    if (countryGeo != null) {
      countryGeo.properties.years = {};

      countryData.years.forEach((yearData, year) => {
        countryGeo.properties.years[`_${year}`] = yearData;
      });
    } else {
      console.log(country);
    }
  });

  console.log('Countries data reworked.');

  const countriesJSONGeo = JSON.stringify(countries);

  fs.writeFileSync(output, countriesJSONGeo);

  console.log('All data processed.');
  console.log(`Min total: ${minTotal}`);
  console.log(`Max total: ${maxTotal}`);
});
