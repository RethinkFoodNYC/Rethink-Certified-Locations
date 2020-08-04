import * as A from '../actions';
import { STATE as S } from '../globals/constants';

const initialState = {
  [S.IS_SIGNED_IN]: false, // is user signed in?
  [S.DATA]: [], // remains empty until a user signs in, then is filled through GoogleAuth
  [S.VISIBLE_STATUS]: [], // is the corresponding data point open in the list? i.e. determines if height = 0 for list view
  [S.TOGGLE_STATUS]: [], // layer visibility & list view toggle on/off
  [S.SELECTED]: null, // this will be the selected point
  [S.BUFFER_RAD]: 1,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case A.SET_SIGNED_IN:
      return { ...state, [S.IS_SIGNED_IN]: action.data };
    case A.SET_DATA:
      return { ...state, [S.DATA]: action.data };
    case A.REMOVE_DATA:
      return { ...state, [S.DATA]: [] };
    case A.SET_SELECTED:
      return { ...state, [S.SELECTED]: action.data };
    case A.SET_SELECTED_ID:
      return { ...state, [S.SELECTED]: action.data };
    case A.SET_RADIUS:
      return { ...state, [S.BUFFER_RAD]: action.data };
    case A.INIT_CATEGORIES: {
      const obj = action.data.reduce((acc, cat) => ({
        ...acc,
        [cat]: true,
      }), {});
      return {
        ...state,
        [S.VISIBLE_STATUS]: obj,
        [S.TOGGLE_STATUS]: obj,
      };
    }
    case A.UPDATE_VISIBLE_STATUS:
      return {
        ...state,
        [S.VISIBLE_STATUS]: {
          ...state[S.VISIBLE_STATUS],
          [action.category]: action.status,
        },
      };
    case A.UPDATE_TOGGLE_STATUS:
      return {
        ...state,
        [S.TOGGLE_STATUS]: {
          ...state[S.TOGGLE_STATUS],
          [action.category]: !state[S.TOGGLE_STATUS][action.category],
        },
      };
    default:
      return state;
  }
}
