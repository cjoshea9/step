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
function updateWeather(lat, lon, city_num) {
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

      let cities = ["Chicago", "Mountian View", "New York", "Boulder", "Cambridge", "London", "Dublin", "Singapore", "Sydney", "Tokyo"]
      $('#city').html(cities[city_num])
      $('#temp').html("Temperature: " + round(temp_f) + "°F");
      $('#humidity').html("Humidity: " + round(humidity) + "%");
      $('#weather').html(weather);
      $('#wind').html("Wind: " + round(wind_speed) + " mph");
      $('#fog').html("Fog: " + round(fog) + "%");
    }

		/**
 		* Rounds input to one decimal
 		*/
    function round(num) {
        return Math.round(num*10)/10;
    }

    weather();
  });

}
