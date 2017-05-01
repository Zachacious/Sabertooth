/*
    alignment.js
 */

import Point from '.././point';
import EventEmitter from 'eventemitter3';

/**
 * Alignment class holds alignment policies for horizontal
 * and vertical alignments - alignments are static callback
 * methods that return a relative position offset for the widget to
 * its parent.
 * @memberof UI
 */
export default class Alignment extends EventEmitter {
    /**
     * @param {Function} [hAlign=Alignment.left] - default left align
     * @param {Function} [vAlign=Alignment.top] - default top align
     */
    constructor(hAlign = Alignment.left, vAlign = Alignment.top) {
        super();
        /**
         * Holds the HORIZONTAL alignment
         * @type {Function}
         */
        this.hAlign = hAlign;

        /**
         * Holds the VERTICAL alignment
         * @type {Function}
         */
        this.vAlign = vAlign;
    }

    /**
     * Get a position offset from alignments
     * @param {UI.Widgets.BaseWidget} parent - the parent widget
     * @param {Number} targetWidth - the widgets width
     * @param {Number} targetHeight - the widgets height
     * @return {Point} - the calculated offset relative to the parent
     */
    getOffset(parent, targetWidth, targetHeight) {
        let offset = new Point();
        offset.x = this.hAlign(targetWidth, parent);
        offset.y = this.vAlign(targetHeight, parent);
        return offset;
    }

    // ALIGNMENTS ---

    /**
     * Left Alignment
     * @static
     * @param {Number} targetWidth - the widgets width
     * @param {UI.Widgets.BaseWidget} parent - the parent widget
     * @return {Number} - HORIZONTAL offset
     */
    static left(targetWidth, parent) {
        // return 0;
        return parent.padding.left;
    }

    /**
     * Center Alignment
     * @static
     * @param {Number} targetWidth - the widgets width
     * @param {UI.Widgets.BaseWidget} parent - the parent widget
     * @return {Number} - HORIZONTAL offset
     */
    static center(targetWidth, parent) {
        // let pad = 0; // parent.padding.left;//  + parent.padding.right;
        return ((parent.width / 2) - (targetWidth / 2));// - pad;
    }

    /**
     * Right Alignment
     * @static
     * @param {Number} targetWidth - the widgets width
     * @param {UI.Widgets.BaseWidget} parent - the parent widget
     * @return {Number} - HORIZONTAL offset
     */
    static right(targetWidth, parent) {
        // left padding is allready added to position must remove both
        // let pad = 0;// parent.padding.right;// + parent.padding.left;
        return (parent.width - targetWidth);// - pad;
    }

    /**
     * Top Alignment
     * @static
     * @param {Number} targetHeight - the widgets width
     * @param {UI.Widgets.BaseWidget} parent - the parent widget
     * @return {Number} - VERTICAL offset
     */
    static top(targetHeight, parent) {
        // return 0;
        return parent.padding.top;
    }

    /**
     * Middle Alignment
     * @static
     * @param {Number} targetHeight - the widgets width
     * @param {UI.Widgets.BaseWidget} parent - the parent widget
     * @return {Number} - VERTICAL offset
     */
    static middle(targetHeight, parent) {
        // let pad = 0;// parent.padding.top;// + parent.padding.bottom;
        return ((parent.height / 2) - (targetHeight / 2));// - pad;
    }

    /**
     * Bottom Alignment
     * @static
     * @param {Number} targetHeight - the widgets width
     * @param {UI.Widgets.BaseWidget} parent - the parent widget
     * @return {Number} - VERTICAL offset
     */
    static bottom(targetHeight, parent) {
        // let pad = 0;// parent.padding.bottom + parent.padding.top;
        return (parent.height - targetHeight);// - pad;
    }
}
