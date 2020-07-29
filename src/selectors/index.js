import { createSelector } from 'reselect';
import { distance, getUniqueID } from '../globals/helpers';
import { KEYS as K, STATE as S } from '../globals/constants';

/** Basic Selectors */
export const getSignedInStatus = (state) => state[S.IS_SIGNED_IN];
export const getData = (state) => state[S.DATA];
export const getVisibleInList = (state) => state[S.VISIBLE_STATUS];
export const getToggleStatus = (state) => state[S.TOGGLE_STATUS];
export const getSelectedUniqueID = (state) => state[S.SELECTED];

/** Data Manipulations */
export const getFlatData = createSelector([
  getData,
], (data) => [...data].map(([, layerData]) => layerData).flat());

export const getFlatDataMap = createSelector([
  getFlatData,
], (flatData) => new Map([...flatData].map((d) => [getUniqueID(d), d])));

export const getSelected = createSelector([
  getSelectedUniqueID,
  getFlatDataMap,
], (selectedID, flatDataMap) => (flatDataMap.has(selectedID) ? flatDataMap.get(selectedID) : null));

export const getDistances = createSelector([
  getSelectedUniqueID, getFlatDataMap,
], (selectedID, flatDataMap) => {
  if (selectedID === null) {
    return null;
  }
  const selected = flatDataMap.get(selectedID);
  return new Map([...flatDataMap].map(([uniqueID, d]) => {
    const dist = distance(
      selected[K.LAT],
      selected[K.LONG],
      d[K.LAT],
      d[K.LONG],
    );
    return [uniqueID, dist];
  }));
});

export const getInBuffer = createSelector([
  getDistances,
], (distanceMap) => {
  if (distanceMap === null) {
    return [];
  }
  return Array.from(distanceMap.entries()).filter(([uniqueID, dist]) => dist < 1).map(([uniqueID, dist]) => uniqueID);
});
