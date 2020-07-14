import './style.scss';
import { select } from 'd3';

export default class Header {
    constructor() {
        const parent = select('#header');

        parent
            .append('div')
            .attr('class', 'logo');
    }
}
