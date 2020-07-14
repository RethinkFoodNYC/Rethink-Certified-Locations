import './style.scss';
import { select, event } from 'd3';

const parent = select('#header');
parent
    .attr('class', 'header');

parent
    .append('div')
    .attr('class', 'logo');

export default class Header {
    constructor(setGlobalState) {
        this.setGlobalState = setGlobalState;
    }

    addData() {

    }
}
