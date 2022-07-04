/* eslint-disable */


export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia29seW56YiIsImEiOiJja3Y5NmxpM2MwM3EzMnltZ2lmYzRhMWtpIn0.aIlKL5z6H1LcSvTAI5ZX2A';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kolynzb/cl01r2yob004g14qi8c73gp85',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interative: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //add popup marker
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //extend the map bounds to include currrent location
    bounds.extend(loc.coordinates);

    //
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 }
  });
};
