import { KEYS as K } from './constants';

export function getUniqueID(data) {
  return `${data[K.NAME].replace(/\s/g, '')}_${data[K.LONG]}_${data[K.LAT]}`
}

// source of below: https://www.geodatasource.com/developers/javascript
export function distance(lat1, lon1, lat2, lon2) {
  const pi = 3.14159265358979323846
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0;
  } else {
    const radlat1 = pi * lat1/180;
    const radlat2 = pi * lat2/180;
    const theta = lon1-lon2;
    const radtheta = pi * theta/180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/pi;
    // dist = dist * 60 * 1.1515; // in Miles
    dist = dist * 60 * 1.5; // this is a better approximation to the turf results
    return dist;
  }
}

export function convertToTSV(data) {
  const headers = Object.keys(data[0]);
  const stringRows = data.map((row) => headers
    .map((fieldName) => row[fieldName])
    .join('\t'));
  return ['data:text/csv;charset=utf-8,', headers.join('\t'), ...stringRows].join('\r\n');
}
