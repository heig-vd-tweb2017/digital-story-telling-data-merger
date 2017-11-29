# Project - Digital Story Telling
This project is conducted for the course "TWEB-2017", at HEIG-VD, Switzerland.

* Teacher: Olivier Liechti.
* Authors: Ludovic Delafontaine & Michela Zucca.

## What is this
This project proposes to redact an article and add some interactivity in it.
	
* We have chosen to speak about meat consumption, its problems and some solutions.
* We added some interactive parts to display some information that the user can play with.
* We asked Ludovic's sister, Magali, if she wanted to illustrate the website. She kindly accepted and did an amazing job !
	
During the redaction of the article, we didn't want to take side or blame the user by its meat's consumption habits. This is why we tried to give facts, numbers and statistics as well as some solutions at the end of the article so no one feels aggressed by reading the article.
	
## Why is this
We wanted to redact this article to encourage people to think about their meat's consumption habits and try to improve their way of eating so they would preserve the earth, improve animals' conditions and help to decrease hunger in the world.

## How is this
For this project, we used several librairies and technologies.

### Client side
* [Freelancer](http://startbootstrap.com/template-overviews/freelancer/) for the Bootstrap template.
* [Leaflet](http://leafletjs.com/) to display the world map with meat's consumption.
* [Mapbox](https://www.mapbox.com/), combined with Leaflet to display nice tiles on the map
* [Our own data merger](https://github.com/heig-vd-tweb2017/digital-story-telling-data-merger) to populate the map with our custom datas.
* [Data-Driven Documents (D3)](https://d3js.org/) to create the interactive images with SVG elements
* [MathJax](https://www.mathjax.org) to display equations properly
* [SVGOMG](https://jakearchibald.github.io/svgomg/) to optimize our SVGs so they are normalized and way more smaller (+90% smaller !)

### Data merger side
* [Node.js](https://nodejs.org/) for the execution engine.
* [PapaParse](http://papaparse.com/) to parse the CSV datasets.

### On both sides
* [ESLint](https://eslint.org/) for quality code control.

## Live preview
You can test the entire application [here](https://heig-vd-tweb2017.github.io/digital-story-telling-client/). Feel free to test it !

## Client's aspects
For data merger's aspects, we encourage you to visit the associated repository [here](https://github.com/heig-vd-tweb2017/digital-story-telling-client).

## Data merger's aspects
The data merger uses two datasets and create a new one with all the properties we need for our project.

The datasets are the followings:

* [countries.geo.json](https://github.com/johan/world.geo.json/blob/master/countries.geo.json) to have all the countries as SVG's polygon for Leaflet's map. JSON format.
* [Food and Agriculture Organization of the United Nations - All Data Normalized's data](http://www.fao.org/faostat/en/#data/CL) which has the livesock and fish consumption for every country from 1961 to 2013. CSV format.

The `data-converter.js` script takes the FAO dataset and parse it to combine the meat consomption by big categories (red, white and water meats) by year by country to get the consumption for all the year and the average meat consumption by person by week.

When the FAO dataset is reworked for our needs, it parse the `countries.geo.json` to dynamically add the previous computed data to the JSON structure.

### Before
```
{
    "type": "Feature",
    "id": "CHE",
    "properties": {
        "name": "Switzerland"
    },
    "geometry": { ... }
},
```

### After
```
{
    "type": "Feature",
    "id": "CHE",
    "properties": {
        "name": "Switzerland",
        "years": {
            "_1961": {
                "tonnes": {
                    "redMeat": 486850.95,
                    "whiteMeat": 167101.95,
                    "waterMeat": 82332.18,
                    "total": 736285.0800000001
                },
                "kgPerPersonPerWeek": {
                    "redMeat": 1.7359615384615386,
                    "whiteMeat": 0.5957692307692308,
                    "waterMeat": 0.29365384615384615,
                    "total": 2.6253846153846156
                }
            },
            "_1962": {
                "tonnes": {
                    "redMeat": 528831.16,
                    ...
    },
    "geometry": { ... }
},
```

When the data for every country are injected in the `countries.geo.json`'s file, it saves it and is ready to use with Leaflet.

For more information about GeoJson, have a look [here](http://geojson.org/).
