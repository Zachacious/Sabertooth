/*
    Point.js
 */

import EventEmitter from 'eventemitter3';

/**
 * Hold position data.
 * Note: Could use PIXI.Point instead if you dont need
 * the signal/ slot mechanism.
 * @memberof UI
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
         * @type {Number}
         * @private
         */
        this._x = x;

        /**
         * Internal y coordinate
         * @type {Number}
         * @private
         */
        this._y = y;
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
