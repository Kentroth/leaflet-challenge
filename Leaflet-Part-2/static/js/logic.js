// Creating the map object
let myMap = L.map("map", {
  center: [37.5, -112.5],
  zoom: 4,
});

// Adding the tile layers
const streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

const darkMap = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>',
});

const satelliteMap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: '&copy; Esri',
  maxZoom: 18,
});

// Create separate overlay groups for earthquakes and tectonic plates
const earthquakesOverlay = L.layerGroup().addTo(myMap);
const tectonicPlatesOverlay = L.layerGroup().addTo(myMap);

// Define the depth color scale
const depthScale = chroma.scale(['green', 'yellow', 'red']).domain([0, 180]).mode('lab');

// URL for earthquake data
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch earthquake data using D3
d3.json(geoData)
  .then(data => {
    console.log("Data:", data); // Log the fetched data
    data.features.forEach(feature => {
      const magnitude = feature.properties.mag;
      const depth = feature.geometry.coordinates[2];
      const latitude = feature.geometry.coordinates[1];
      const longitude = feature.geometry.coordinates[0];

      // Determine marker size based on magnitude
      const markerSize = magnitude * 4;

      // Determine marker color based on depth
      const markerColor = depthScale(depth).hex();

      // Create a marker with size and color based on magnitude and depth
      const marker = L.circleMarker([latitude, longitude], {
        radius: markerSize,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.8
      }).addTo(earthquakesOverlay);

      // Add a popup with magnitude and depth information
      marker.bindPopup(`Magnitude: ${magnitude}<br>Depth: ${depth} km`);
    });

    // Add the legend to the map
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'legend');
      const labels = ['<strong>Depth Legend</strong>'];
      const depths = [0, 60, 120, 180];

      // Iterate through the depth levels and create legend labels
      depths.forEach((depth, index) => {
        const color = depthScale(depth).hex();
        const label =
          index === depths.length - 1
            ? `${depth}+ km`
            : `${depth} - ${depths[index + 1]} km`;
        labels.push(
          `<i style="background: ${color}"></i> ${label}`
        );
      });

      div.innerHTML = labels.join('<br>');
      return div;
    };
    legend.addTo(myMap);
  })
  .catch(error => {
    console.error("Error fetching earthquake data:", error);
  });

// Fetch tectonic plates GeoJSON data
const tectonicPlatesData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Create a tectonic plates layer using the fetched data
fetch(tectonicPlatesData)
  .then(response => response.json())
  .then(platesData => {
    const tectonicPlatesLayer = L.geoJSON(platesData, {
      style: {
        color: 'orange',
        weight: 2,
      },
    }).addTo(tectonicPlatesOverlay);
  })
  .catch(error => {
    console.error("Error fetching tectonic plates data:", error);
  });

// Create a base maps object
const baseMaps = {
  "Street Map": streetMap,
  "Dark Map": darkMap,
  "Satellite Map": satelliteMap,
};

// Create an overlay maps object
const overlayMaps = {
  "Earthquakes": earthquakesOverlay,
  "Tectonic Plates": tectonicPlatesOverlay,
};

// Set the default map layer to Satellite Map
satelliteMap.addTo(myMap);

// Add layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);
