import './style.scss';
import App from './src/components/App';

new App().init();
// const transformRequest = (url, resourceType) => {
//   const isMapboxRequest = url.slice(8, 22) === 'api.mapbox.com'
//         || url.slice(10, 26) === 'tiles.mapbox.com';
//   return {
//     url: isMapboxRequest
//       ? url.replace('?', '?pluginName=sheetMapper&')
//       : url,
//   };
// };
// // YOUR TURN: add your Mapbox token
// mapboxgl.accessToken = 'pk.eyJ1IjoidHdvbmluYyIsImEiOiJja2Jrd3R3Y3owYmU1MnBtZWJpamYzM25kIn0.Ux4w99PgqsjbjYaPZstK3A'; // Mapbox token
// const map = new mapboxgl.Map({
//   container: 'map', // container id
//   style: 'mapbox://styles/twoninc/ckbkwx8sc0m3g1imu2wlu90ue', // stylesheet location
//   center: [-73.9716, 40.6992], // starting position, Brookyln Navy Yard
//   zoom: 9, // starting zoom
//   transformRequest,
// });

// $(document).ready(() => {
//   $.ajax({
//     type: 'GET',
//     // YOUR TURN: Replace with csv export link
//     url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLYxlWp1q0q56XHpau48BiX7xag6DKtIQ-CyK6nWF9Dol07XaG4uoMPp5TpPNy-dzXjhJBw9CewVnj/pub?gid=0&single=true&output=csv',
//     dataType: 'text',
//     success(csvData) { makeGeoJSON(csvData); },
//   });

//   function makeGeoJSON(csvData) {
//     csv2geojson.csv2geojson(csvData, {
//       latfield: 'Latitude',
//       lonfield: 'Longitude',
//       delimiter: ',',
//     }, (err, data) => {
//       map.on('load', () => {
//         // Add the the layer to the map
//         map.addLayer({
//           id: 'csvData',
//           type: 'circle',
//           source: {
//             type: 'geojson',
//             data,
//           },
//           paint: {
//             'circle-radius': 5,
//             'circle-color': 'purple',
//           },
//         });

//         // start radius code
//         // TODO: make createGeoJSONCircle iterate through the list of lat longs to fill in center for each point
//         const createGeoJSONCircle = function (center, radiusInKm, points) {
//           if (!points) points = 64; // automatically makes a 64-sided polygon, looks like a circle on the map

//           const coords = {
//             latitude: center[1],
//             longitude: center[0],
//           };

//           const km = radiusInKm;

//           const ret = [];
//           const distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
//           const distanceY = km / 110.574;

//           let theta; let x; let
//             y;
//           for (let i = 0; i < points; i++) {
//             theta = (i / points) * (2 * Math.PI);
//             x = distanceX * Math.cos(theta);
//             y = distanceY * Math.sin(theta);

//             ret.push([coords.longitude + x, coords.latitude + y]);
//           }
//           ret.push(ret[0]);

//           return {
//             type: 'geojson',
//             data: {
//               type: 'FeatureCollection',
//               features: [{
//                 type: 'Feature',
//                 geometry: {
//                   type: 'Polygon',
//                   coordinates: [ret],
//                 },
//               }],
//             },
//           };
//         };
//         console.log('data', data);
//         console.log('data.features', data.features[0].geometry.coordinates);

//         // Add radius to one point
//         let i;
//         for (i = 0; i < data.features.length; i++) { // "polygon" must update to "polygon1", "polygon2"
//           map.addSource(`polygon${i}`, createGeoJSONCircle(data.features[i].geometry.coordinates, 1)); // (center coordinates, radius in km)
//           map.addLayer({
//             id: `polygon${i}`,
//             type: 'fill',
//             source: `polygon${i}`,
//             layout: {},
//             paint: {
//               'fill-color': 'blue',
//               'fill-opacity': 0.6,
//             },
//           });
//           console.log(`polygon${i}`);
//         }

//         // When a click event occurs on a feature in the csvData layer, open a popup at the
//         // location of the feature, with description HTML from its properties.
//         map.on('click', 'csvData', (e) => {
//           const coordinates = e.features[0].geometry.coordinates.slice();

//           // set popup text
//           // You can adjust the values of the popup to match the headers of your CSV.
//           // For example: e.features[0].properties.Name is retrieving information from the field Name in the original CSV.
//           const description = `<h3>${e.features[0].properties.Name}</h3>` + '<h4>' + '<b>' + 'Address: ' + `</b>${e.features[0].properties.Address}</h4>` + '<h4>' + '<b>' + 'Information: ' + `</b>${e.features[0].properties.Information}</h4>`;

//           // Ensure that if the map is zoomed out such that multiple
//           // copies of the feature are visible, the popup appears
//           // over the copy being pointed to.
//           while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
//             coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
//           }

//           // add Popup to map

//           new mapboxgl.Popup()
//             .setLngLat(coordinates)
//             .setHTML(description)
//             .addTo(map);
//         });

//         // Change the cursor to a pointer when the mouse is over the places layer.
//         map.on('mouseenter', 'csvData', () => {
//           map.getCanvas().style.cursor = 'pointer';
//         });

//         // Change it back to a pointer when it leaves.
//         map.on('mouseleave', 'places', () => {
//           map.getCanvas().style.cursor = '';
//         });

//         const bbox = turf.bbox(data);
//         map.fitBounds(bbox, { padding: 50 });
//       });
//     });
//   }
// });