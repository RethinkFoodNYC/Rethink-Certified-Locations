import { KEYS as K } from './constants';

export function getUniqueID(data) {
  return `${data[K.NAME]}_${data[K.LONG]}_${data[K.LAT]}`
}