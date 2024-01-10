// Create map object with streetmap layer to display on load.
let myMap = L.map("map", {
    center: [
      12.5, 10.5
       ],
    zoom: 3,
  });
  
    // Create layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  
  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };
  
  // set streetmap as default layer:
  street.addTo(myMap);
  
  
  // Define a function to calculate the marker radius based on magnitude
  function getMarkerRadius(mag) {
    // Adjust the scaling factor as needed
    const scalingFactor = 10;
   
   // Calculate the radius using a simple linear scaling function
    return Math.sqrt(mag) * scalingFactor;
  }
  
  // Define a function to determine the color based on Depth
  function getColor(depth) {
    if (depth >= 300) {
      return '#4A235A';
    } else if (depth >= 200) {
      return '#9B59B6';
    } else if (depth >= 75) {
      return '#CB4335'; 
    } else if (depth >= 50) {
      return '#F1948';
    } else if (depth >= 25) {
      return 'F5B7B1';
    } else if (depth >= 10) {
      return '#F9E79F';
    } else {return '#FCF3CF'};
  }
  
  //Get earthquake data from the UUGS API and store API endpoint as queryUrl.
  let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  
  //Function to get data
  function createFeatures() {
  
    // Perform a GET request to the query URL/
    d3.json(queryUrl).then(function (earthquakeData) {
      
  
        // Create a GeoJSON layer that contains the features array on the earthquakeData object.
      let earthquakes = L.geoJSON(earthquakeData, {
            pointToLayer: function (feature, latlng) {
              //Define depth, magnitude and place for circleMarker
              const depth = feature.geometry.coordinates[2];
              const place = feature.properties.place;
              const mag = feature.properties.mag;
  
              
            // Define what the circle marker will look likeat the earthquake's location
            const circleMarkerStyle = {
              radius: getMarkerRadius(mag),
              fillColor: getColor(depth),
              color: 'black', 
              weight: 1,
              opacity: 1,
              fillOpacity: 0.75
            };
      
            //Set popup attributes
            const information = `<h2>${feature.properties.place}</h2><hr><h2>Eartquake Magnitude: ${feature.properties.mag}</h2><hr><h3>Depth: ${depth} meters<h3><hr></h2><p>${new Date(feature.properties.time)}</p>`;
            
            // bind popup to circlemarker
            const quakeMarker = L.circleMarker(latlng, circleMarkerStyle);
            quakeMarker.bindPopup(information);
            return quakeMarker;
          }
      });
  
      function createLegend() {
        const legend = L.control({ position: 'bottomright' });
      
        const depthRanges = ['<10', '10-25', '25-50', '50-75', '75-100', '100-200', '>300'];
        const legendColors = ['#FCF3CF', '#F9E79F', '#F5B7B1', '#F1948A', '#CB4335', '#9B59B6', '#4A235A'];
      
        // Define the legend content      
        legend.onAdd = function (map) {
           // Create a div element for the legend
          const div = L.DomUtil.create('div', 'legend');
          div.style.backgroundColor = 'white';
          div.style.padding = '10px';
          div.style.borderRadius = '5px';
          div.style.border = "1px solid black";
          div.style.opacity = '0.9';
      
          let labels = '<strong>Earthquake depth (m)</strong><br>';
      
          for (let i = 0; i < depthRanges.length; i++) {
            const color = legendColors[i];
            const label = depthRanges[i];
            labels +=
              '<i style="background:' + color + '"></i> ' +
              label + '<br>';
          }
      
          div.innerHTML = `
          <div style="background-color: white; padding: 10px; border: 1px solid black;">
            <strong>Earthquake depth (m)</strong><br>
            <table>
              <tr>
                <td><div style="width: 20px; height: 20px; background-color: #FCF3CF;"></div></td>
                <td>&lt;10</td>
              </tr>
              <tr>
                <td><div style="width: 20px; height: 20px; background-color: #F9E79F;"></div></td>
                <td>10-25</td>
              </tr>
              <tr>
                <td><div style="width: 20px; height: 20px; background-color: #F5B7B1;"></div></td>
                <td>25-50</td>
              </tr>
              <tr>
                <td><div style="width: 20px; height: 20px; background-color: #F1948A;"></div></td>
                <td>50-75</td>
              </tr>
              <tr>
                <td><div style="width: 20px; height: 20px; background-color: #CB4335;"></div></td>
                <td>75-100</td>
              </tr>
              <tr>
                <td><div style="width: 20px; height: 20px; background-color: #9B59B6;"></div></td>
                <td>100-200</td>
              </tr>
              <tr>
                <td><div style="width: 20px; height: 20px; background-color: #4A235A;"></div></td>
                <td>&gt;300</td>
              </tr>
            </table>
          </div>
          `;
    
        return div;
      };
        legend.addTo(myMap);
      }
        // Create overlay maps object.
      let overlayMaps = {
        Earthquakes: earthquakes
      };
  
      // Add the earthquake layer to the layer control.
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);
  
      // Add earthquake layer to the map.
      earthquakes.addTo(myMap);
  
      // Add the legend to the map
      createLegend();
    });
  }
  
  // Add the earthquake layer to the layer control
  createFeatures();