import './style.scss';
import { select } from 'd3';

export default class Logo {
    constructor() {
        const parent = select('#footer');

        parent
            .append('a')
            .attr('class', 'twonlogo')
            .attr('href', 'http://www.two-n.com/')
            .attr('target', '_blank');
    }
}
