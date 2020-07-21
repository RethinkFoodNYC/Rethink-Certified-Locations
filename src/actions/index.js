import { getUniqueID } from '../globals/helpers';

export const SET_SIGNED_IN = 'SET_SIGNED_IN';
export const setSignedIn = (boolean) => ({
  type: SET_SIGNED_IN,
  data: boolean,
});

export const SET_DATA = 'SET_DATA';
export const setData = (data) => ({
  type: SET_DATA,
  data,
});

export const REMOVE_DATA = 'REMOVE_DATA';
export const removeData = () => ({
  type: REMOVE_DATA,
});

export const SET_SELECTED = 'SET_SELECTED';
export const setSelected = (dataPoint) => ({
  type: SET_SELECTED,
  data: dataPoint === null ? null : getUniqueID(dataPoint),
});

export const INIT_CATEGORIES = 'INIT_CATEGORIES';
export const initCategories = (categories) => ({
  type: INIT_CATEGORIES,
  data: categories,
});

export const UPDATE_VISIBLE_STATUS = 'UPDATE_VISIBLE_STATUS';
export const updateVisible = (category, status) => ({
  type: UPDATE_VISIBLE_STATUS,
  category: category,
  status: status,
});

export const UPDATE_TOGGLE_STATUS = 'UPDATE_TOGGLE_STATUS';
export const updateToggle = (category, status) => ({
  type: UPDATE_TOGGLE_STATUS,
  category,
  status,
});
