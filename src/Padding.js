/*
    padding.js
 */

import EventEmitter from 'eventemitter3';

/**
 * Padding componenet holds padding data for 4 sides
 * @memberof UI
 */
export default class Padding extends EventEmitter {
    /**
     * @param {Number} [top=0]
     * @param {Number} [left=0]
     * @param {Number} [bottom=0]
     * @param {Number} [right=0]
     */
    constructor(top = 0, left = 0, bottom = 0, right = 0) {
        super();

        /**
         * Internal top padding
         * @type {Number}
         * @private
         */
        this._top = top;

        /**
         * Internal left padding
         * @type {Number}
         * @private
         */
        this._left = left;

        /**
         * Internal bottom padding
         * @type {Number}
         * @private
         */
        this._bottom = bottom;

        /**
         * Internal right padding
         * @type {Number}
         * @private
         */
        this._right = right;
    }

    /**
     * Convienent way to set all paddings to different values
     * @param {Number} [top=0]
     * @param {Number} [left=0]
     * @param {Number} [bottom=0]
     * @param {Number} [right=0]
     * @return {Array} - Contains padding values
     */
    set(top = 0, left = 0, bottom = 0, right = 0) {
        this._top = top;
        this._left = left;
        this._bottom = bottom;
        this._right = right;
        // this.signal_paddingChanged.emit(this);
        this.emit('paddingChanged', this);
        return [top, left, bottom, right];
    }

    /**
     * Set all padding to the same value
     * @param {Number} [val=0] - the amount of padding
     * @return {Number} - the padding
     */
    setAllTo(val = 0) {
        this._top = this._bottom = this._left = this._right = val;
        // this.signal_paddingChanged.emit(this);
        this.emit('paddingChanged', this);
        return val;
    }

    // properties

    /**
     * Top padding
     * @return {Number}
     */
    get top() {
        return this._top;
    }

    set top(val) { // eslint-disable-line require-jsdoc
        this._top = val;
        this.emit('paddingChanged', this);
    }

    /**
     * Left padding
     * @return {Number}
     */
    get left() {
        return this._left;
    }

    set left(val) { // eslint-disable-line require-jsdoc
        this._left = val;
        this.emit('paddingChanged', this);
    }

    /**
     * Bottom padding
     * @return {Number}
     */
    get bottom() {
        return this._bottom;
    }

    set bottom(val) { // eslint-disable-line require-jsdoc
        this._bottom = val;
        this.emit('paddingChanged', this);
    }
    /**
     * Right padding
     * @return {Number}
     */
    get right() {
        return this._right;
    }

    set right(val) { // eslint-disable-line require-jsdoc
        this._right = val;
        this.emit('paddingChanged', this);
    }
}
