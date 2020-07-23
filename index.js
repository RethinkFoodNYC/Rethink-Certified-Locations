import './style.scss';
import App from './src/components/App';
import configureStore from './src/store';

const store = configureStore();
new App(store).init();
