import './style.scss';
import { select, event } from 'd3';
import { STATE as S } from '../../globals/constants';

export default class Header {
    constructor(state) {
        const parent = select('#header');

        parent
            .append('a')
            .attr('class', 'logo')
            .attr('href', 'https://www.rethinkfood.nyc/');
    }
}
