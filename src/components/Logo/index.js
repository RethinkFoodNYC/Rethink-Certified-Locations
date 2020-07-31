import './style.scss';
import { select } from 'd3';

export default class Logo {
    constructor() {
        const parent = select('#footer');

        parent
            .append('a')
            .attr('class', 'twonlogo')
            .attr('href', 'https://www.two-n.com/');

        console.log('working');
    }
}
