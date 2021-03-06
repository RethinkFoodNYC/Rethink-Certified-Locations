import regeneratorRuntime from 'regenerator-runtime';
import Mapbox from './Mapbox/index';
import GoogleAuth from './GoogleAuth';
import List from './List';
import Header from './Header';
import { STATE as S } from '../globals/constants';
import * as Sel from '../selectors';
import * as Act from '../actions';
import Logo from './Logo';

// initialize both components with data
export default class App {
  constructor(store) {
    this.store = store;
    // store.subscribe(() => console.log('subscriber update:', store.getState()));
  }

  init() {
    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.update = this.update.bind(this); // to leverage in components

    // sets up google authentication client
    // once a user logs in, automatically fetches data
    // once data is fetched, it passes it into the callback to initialize map
    this.googleAuth = new GoogleAuth(this.handleLogIn, this.handleLogOut);
    this.list = new List(this.store, this.update);
    this.map = new Mapbox(this.store, this.update, this.list.updateRangeRadius);
    this.header = new Header();
    this.logo = new Logo();
  }

  // gets called once user has logged in
  handleLogIn(data) {
    this.store.dispatch(Act.setSignedIn(true));
    this.store.dispatch(Act.setData(data));
    this.map.addData();
    this.list.addData();
  }

  // gets called when a user signs out of app
  handleLogOut() {
    this.store.dispatch(Act.setSignedIn(false));
    this.store.dispatch(Act.removeData());
    this.map.removeData();
    this.list.removeData();
  }

  update() {
    this.map.draw();
    this.list.draw();
  }
}
