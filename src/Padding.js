import EventEmitter from 'eventemitter3';

/**
 * Padding componenet holds padding data for 4 sides
 * @memberof ST
 * @extends external:EventEmitter
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
         * @member {Number}
         * @private
         */
        this._top = top;

        /**
         * Internal left padding
         * @member {Number}
         * @private
         */
        this._left = left;

        /**
         * Internal bottom padding
         * @member {Number}
         * @private
         */
        this._bottom = bottom;

        /**
         * Internal right padding
         * @member {Number}
         * @private
         */
        this._right = right;

        /**
         * Fires when one or more of the paddings have changed
         * @event ST.Padding#changed
         */
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
        this.emit('changed', this);
        return [top, left, bottom, right];
    }

    /**
     * Set all padding to the same value
     * @param {Number} [val=0] - the amount of padding
     * @return {Number} - the padding
     */
    setAllTo(val = 0) {
        this._top = this._bottom = this._left = this._right = val;
        this.emit('changed', this);
        return val;
    }

    /**
     * Top padding
     * @member {Number}
     */
    get top() {
        return this._top;
    }

    set top(val) { // eslint-disable-line require-jsdoc
        this._top = val;
        this.emit('changed', this);
    }

    /**
     * Left padding
     * @member {Number}
     */
    get left() {
        return this._left;
    }

    set left(val) { // eslint-disable-line require-jsdoc
        this._left = val;
        this.emit('changed', this);
    }

    /**
     * Bottom padding
     * @member {Number}
     */
    get bottom() {
        return this._bottom;
    }

    set bottom(val) { // eslint-disable-line require-jsdoc
        this._bottom = val;
        this.emit('changed', this);
    }
    /**
     * Right padding
     * @member {Number}
     */
    get right() {
        return this._right;
    }

    set right(val) { // eslint-disable-line require-jsdoc
        this._right = val;
        this.emit('changed', this);
    }
}
