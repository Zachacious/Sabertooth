import EventEmitter from 'eventemitter3';

/**
 * The EventEmitter namespace
 * @external EventEmitter
 * @see https://github.com/primus/eventemitter3
 */

/**
 * Holds size information
 * @memberof ST
 * @extends external:EventEmitter
 */
export default class Size extends EventEmitter {
    /**
     * @param {Number} [width=0]
     * @param {Number} [height=0]
     */
    constructor(width = 0, height = 0) {
        super();

        /**
         * Internal width
         * @member {Number}
         * @private
         */
        this._width = width;

        /**
         * Internal height
         * @member {Number}
         * @private
         */
        this._height = height;

        /**
         * Fires when size data changes
         * @event ST.Size#changed
         */
    }

    /**
     * Convienece to set both width and height at once
     * @param {Number} [width=0]
     * @param {Number} [height=0]
     */
    set(width = 0, height = 0) {
        this._width = width;
        this._height = height;
        this.emit('changed', this);
    }

    /**
     * @member {Number}
     */
    get width() {
        return this._width;
    }

    set width(val) { // eslint-disable-line require-jsdoc
        this._width = val;
        this.emit('changed', this);
    }

    /**
     * @member {Number}
     */
    get height() {
        return this._height;
    }

    set height(val) { // eslint-disable-line require-jsdoc
        this._height = val;
        this.emit('changed', this);
    }
}
