import Mapbox from './Mapbox/index';
import GoogleAuth from './GoogleAuth';
import List from './List';
import Header from './Header';
import { STATE as S } from '../globals/constants';

// global state
let state = {
  [S.IS_SIGNED_IN]: false, // is user signed in?
  [S.DATA]: [], // remains empty until a user signs in, then is filled through GoogleAuth
  [S.VISIBLE_IN_LIST]: [], // is the corresponding data point open in the list? i.e. determines if height = 0 for list view
  [S.TOGGLE_ON]: [], // layer visibility & list view toggle on/off
  [S.IN_BUFFER]: [], // is this point within the buffered zone (one mile radius) of the `selected` point?
  [S.SELECTED]: null, // this will be the selected point
};

// initialize both components with data
export default class App {
  init() {
    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.setGlobalState = this.setGlobalState.bind(this);

    // sets up google authentication client
    // once a user logs in, automatically fetches data
    // once data is fetched, it passes it into the callback to initialize map
    this.googleAuth = new GoogleAuth(this.handleLogIn, this.handleLogOut);
    this.map = new Mapbox(this.setGlobalState, state);
    this.list = new List(this.setGlobalState);
    this.header = new Header(this.setGlobalState);
  }

  // gets called once user has logged in
  handleLogIn(data) {
    // console.log('logged in with data', data)
    this.map.addData(data);
    this.list.addData(data);
    this.setGlobalState({ [S.IS_SIGNED_IN]: true });
    this.setGlobalState({ [S.DATA]: data });
  }

  // gets called when a user signs out of app
  handleLogOut() {
    // console.log('logged out, removing data')
    this.map.removeData();
    this.list.removeData();
    this.setGlobalState({ [S.IS_SIGNED_IN]: false });
    this.setGlobalState({ [S.DATA]: [] });
  }

  /*
  UTILITY FUNCTION: state updating function that we pass to our components
  so that they are able to update our global state object
  */
  setGlobalState(newStateObj) {
    state = {
      ...state,
      ...newStateObj,
    };
    console.log('new state:', state);
    this.update();
  }

  update() {
    this.map.draw(state);
    this.list.draw(state);
  }
}
