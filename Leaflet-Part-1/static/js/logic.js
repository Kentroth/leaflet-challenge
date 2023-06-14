// Creating the map object
let myMap = L.map("map", {
    center: [37.5, -112.5],
    zoom: 5
  });
  
  // Adding the tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);
  
  // URL for earthquake data
  let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  
    // Define the depth color scale
    const depthScale = chroma.scale(['green', 'yellow', 'red']).domain([0, 180]).mode('lab');

    // Create a legend control
    const legend = L.control({ position: 'bottomright' });

    // Define the legend content
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
        }).addTo(myMap);
  
        // Add a popup with magnitude and depth information
        marker.bindPopup(`Magnitude: ${magnitude}<br>Depth: ${depth} km`);
      });
  
      // Add the legend to the map
      legend.addTo(myMap);
    })
    .catch(error => {
      console.error("Error fetching earthquake data:", error);
    });
  