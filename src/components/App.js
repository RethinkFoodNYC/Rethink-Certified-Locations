import Mapbox from './Mapbox/index';
import GoogleAuth from './GoogleAuth';
import List from './List';
import { KEYS as K } from '../globals/constants';

// global state
let state = {
  isSignedIn: false, // is user signed in?
  data: [], // remains empty until a user signs in, then is filled through GoogleAuth
  visibleInList: [], // is the corresponding data point open in the list? i.e. determines if height = 0 for list view
  toggleOn: [], // is the list view toggle on or off?
  inBuffer: [], // is this point within the buffered zone (one mile radius) of the `selected` point?
  selected: null, // this will be the selected point
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
  }

  // gets called once user has logged in
  handleLogIn(data) {
    this.map.addData(data);
    this.list.addData(data);
    this.setGlobalState(K.IS_SIGNED_IN, true);
    this.setGlobalState(K.DATA, data);
  }

  // gets called when a user signs out of app
  handleLogOut() {
    this.map.removeData();
    this.list.removeData();
    this.setGlobalState(K.IS_SIGNED_IN, false);
    this.setGlobalState(K.DATA, []);
  }

  // UTILITY FUNCTION: state updating function that we pass to our components so that they are able to update our global state object
  setGlobalState(key, data) {
    state = { ...state, [key]: data };
    console.log('new state:', state);
    this.update();
  }

  update() {
    // this.map.draw(state);
    this.list.draw(state);
  }
}
