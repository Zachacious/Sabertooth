import EventEmitter from 'eventemitter3';

/**
 * The EventEmitter namespace
 * @external EventEmitter
 * @see https://github.com/primus/eventemitter3
 */

/**
 * Hold position data.
 * Like PIXI.Point but with certain events
 * @memberof ST
 * @extends external:EventEmitter
 */
export default class Point extends EventEmitter {
    /**
     * @param {Number} [x=0] - x coordinate
     * @param {Number} [y=0] - y coordinate
     */
    constructor(x = 0, y = 0) {
        super();

        /**
         * Internal x coordinate
         * @member {Number}
         * @private
         */
        this._x = x;

        /**
         * Internal y coordinate
         * @member {Number}
         * @private
         */
        this._y = y;

        /**
         * Fires when positional data changes
         * @event ST.Point#changed
         * @param {ST.Point}
         */
    }

    /**
     * Convient way to set both coordinates
     * @param {Number} [x=0]
     * @param {Number} [y=0]
     */
    set(x = 0, y = 0) {
        this._x = x;
        this._y = y;
        this.emit('changed', this);
    }

    /**
     * The X coodinate
     * @member {Number}
     */
    get x() {
        return this._x;
    }

    set x(val) { // eslint-disable-line require-jsdoc
        this._x = val;
        this.emit('changed', this);
    }

    /**
     * The Y coodinate
     * @member {Number}
     */
    get y() {
        return this._y;
    }

    set y(val) { // eslint-disable-line require-jsdoc
        this._y = val;
        this.emit('changed', this);
    }
}
