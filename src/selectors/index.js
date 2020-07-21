import { createSelector } from 'reselect';
import { distance, getUniqueID } from '../globals/helpers';
import { KEYS as K, STATE as S } from '../globals/constants';

/** Basic Selectors */
export const getSignedInStatus = (store) => store.getState()[S.IS_SIGNED_IN];
export const getData = (store) => store.getState()[S.DATA];
export const getVisibleInList = (store) => store.getState()[S.VISIBLE_STATUS];
export const getToggleStatus = (store) => store.getState()[S.TOGGLE_STATUS];
export const getSelectedUniqueID = (store) => store.getState()[S.SELECTED];
// export const getSelected = (state) => state.getState()[S.SELECTED];

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
], (selectedID, flatDataMap) => {
  console.log('running');
  return flatDataMap.get(selectedID)
});

// export const getInBuffer = createSelector([
//   getFlatData,
//   getSelected,
// ], (flatData, selected) => {
//   console.log('get in buffer updated', selected);
//   return (Array.from(flatData)).filter((d) => distance(
//     d[K.LAT],
//     d[K.LONG],
//     selected[K.LAT],
//     selected[K.LONG],
//   ) < 1);
// });

export const getInBuffer = createSelector([
  getFlatDataMap,
  getSelectedUniqueID,
], (flatDataMap, selectedID) => {
  console.log('get in buffer updated', selectedID);
  const selected = flatDataMap.get(selectedID);
  return (Array.from(flatDataMap.values())).filter((d) => distance(
    d[K.LAT],
    d[K.LONG],
    selected[K.LAT],
    selected[K.LONG],
  ) < 1);
});
