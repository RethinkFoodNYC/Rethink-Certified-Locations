import Mapbox from './Mapbox/index';
import GoogleAuth from './GoogleAuth';
import List from './List';

// global state
let state = {
  signedState: false,
  data: [],
  open: [],
  active: [],
  inBuffer: [],
  selected: null,
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
    this.setGlobalState('signedState', true);
    this.setGlobalState('data', data);
  }

  // gets called when a user signs out of app
  handleLogOut() {
    this.map.removeData();
    this.list.removeData();
    this.setGlobalState('signedState', false);
    this.setGlobalState('data', []);
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
