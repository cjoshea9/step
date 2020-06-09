// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Reloads the weather page based on given latitude and longitude
 */
function updateWeather(lat, lon, city) {
  $(document).ready(function() {
    function weather() {
      let URL = 'https://api.met.no/weatherapi/locationforecast/1.9/?lat=' + lat + '&lon=' + lon;
      $.get(URL, function(data) {
        updateDOM(data);
      })
    }

	/**
 	* Sorts through XML file and sets HTML to relevant information
 	*/
    function updateDOM(data){
      let root_temp = data.querySelectorAll('product > time > location > temperature');
      let temp_c = root_temp[0].getAttribute('value');
	  //Conversion from Celcius to Fahrenheit
      let temp_f = (temp_c*9/5) + 32;
      let root_humid = data.querySelectorAll('product > time > location > humidity');
      let humidity = root_humid[0].getAttribute('value');
      let root_weather = data.querySelectorAll('product > time > location > symbol');
      let weather = root_weather[0].getAttribute('id');
      let root_wind = data.querySelectorAll('product > time > location > windSpeed');
	  //Conversion from meters per second to miles per hour
      let wind_speed = root_wind[0].getAttribute('mps')*2.237;
      let root_fog = data.querySelectorAll('product > time > location > fog');
      let fog = root_fog[0].getAttribute('percent');

      $('#city').html(city)
      $('#temp').html("Temperature: " + round(temp_f) + "°F");
      $('#humidity').html("Humidity: " + round(humidity) + "%");
      $('#weather').html(weather);
      $('#wind').html("Wind: " + round(wind_speed) + " mph");
      $('#fog').html("Fog: " + round(fog) + "%");
    }

    weather();
  });
}

/**
* Rounds input to one decimal
*/
function round(num) {
  return Math.round(num*10)/10;
}

//Loads Google Charts API with API key
const keyFile = new XMLHttpRequest();
let mapsApiKey = '';
keyFile.open("GET", "key.txt", false);
keyFile.onreadystatechange = function () {
  if(keyFile.readyState === 4 && (keyFile.status === 200 || keyFile.status == 0)) {
      mapsApiKey = keyFile.responseText;
  }
}
keyFile.send(null);

google.charts.load('current', {
  'packages':['map'],
  'mapsApiKey': mapsApiKey
});
google.charts.setOnLoadCallback(drawMap);

/**
* Creates Google Maps web card with current temperatures at Google Offices
*/
function drawMap() {
  $(document).ready(function() {
      const rawData = {"Chicago": [41.88,-87.64],
                        "Mountain View": [37.42,-122.08],
                        "New York": [40.74,-74.01],
                        "Boulder": [40.02,-105.26],
                        "Cambridge": [42.36,-71.09],
                        "London": [51.49,-0.14],
                        "Dublin": [53.33,-6.24],
                        "Singapore": [1.28,103.78],
                        "Sydney": [-33.87,151.20],
                        "Tokyo": [35.66,139.70]};

      let formattedData = [['Office', 'Temperature']];
      const dfdArray = [];
      for (let city in rawData) {
        const URL = 'https://api.met.no/weatherapi/locationforecast/1.9/?lat=' + rawData[city][0] + '&lon=' + rawData[city][1];
        const dfd = $.get(URL);
        dfdArray.push(dfd);
      }

      const keys = Object.keys(rawData);
      Promise.all(dfdArray).then(cityInfo => {
        for (let i = 0; i<cityInfo.length; i++) {
          const root_temp = cityInfo[i].querySelectorAll('product > time > location > temperature');
          const temp_c = root_temp[0].getAttribute('value');
	      const temp_f = (temp_c*9/5) + 32;
          formattedData.push([keys[i], keys[i]+": " + round(temp_f) +'°F']);
        }

        let data = google.visualization.arrayToDataTable(formattedData);
        let options = {
          showTooltip: true,
          showInfoWindow: true
        };
        let map = new google.visualization.Map(document.getElementById('regions_div'));
        map.draw(data, options);
      });
    })
}