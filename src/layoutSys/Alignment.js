import Point from '.././Point';
import EventEmitter from 'eventemitter3';

/**
 * Holds alignment policies for horizontal
 * and vertical alignments - alignments are static callback
 * methods that return a relative position offset for the widget to
 * its parent.
 * @memberof ST
 * @extends external:EventEmitter
 *
 * @example
 * let widget = new ST.Widgets.Button(myApp.root, {
 *  width: 100,
 *  height: 30,
 * });
 *
 * widget.layout = new ST.Layouts.VBoxLayout(widget);
 *
 * widget.layout.alignment.hAlign = ST.Alignment.right;
 * widget.layout.alignment.vAlign = ST.Alignment.middle;
 */
export default class Alignment extends EventEmitter {
    /**
     * @param {Function} [hAlign=Alignment.left] Horizontal alignment
     * @param {Function} [vAlign=Alignment.top] Vertical alignment
     */
    constructor(hAlign = Alignment.left, vAlign = Alignment.top) {
        super();
        /**
         * Holds the HORIZONTAL alignment
         * @member {Function}
         */
        this.hAlign = hAlign;

        /**
         * Holds the VERTICAL alignment
         * @member {Function}
         */
        this.vAlign = vAlign;
    }

    /**
     * Get a position offset from alignments
     * @param {ST.Widgets.BaseWidget} parent The parent widget
     * @param {Number} targetWidth The widgets width
     * @param {Number} targetHeight The widgets height
     * @return {Point} The calculated offset relative to the parent
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
     * @param {Number} targetWidth The widgets width
     * @param {ST.Widgets.BaseWidget} parent The parent widget
     * @return {Number} Horizontal offset
     */
    static left(targetWidth, parent) {
        return parent.padding.left;
    }

    /**
     * Center Alignment
     * @static
     * @param {Number} targetWidth The widgets width
     * @param {ST.Widgets.BaseWidget} parent The parent widget
     * @return {Number} Horizontal offset
     */
    static center(targetWidth, parent) {
        return ((parent.width / 2) - (targetWidth / 2));// - pad;
    }

    /**
     * Right Alignment
     * @static
     * @param {Number} targetWidth The widgets width
     * @param {ST.Widgets.BaseWidget} parent The parent widget
     * @return {Number} Horizontal offset
     */
    static right(targetWidth, parent) {
        return (parent.width - targetWidth);
    }

    /**
     * Top Alignment
     * @static
     * @param {Number} targetHeight The widgets width
     * @param {ST.Widgets.BaseWidget} parent The parent widget
     * @return {Number} Vertical offset
     */
    static top(targetHeight, parent) {
        return parent.padding.top;
    }

    /**
     * Middle Alignment
     * @static
     * @param {Number} targetHeight The widgets width
     * @param {ST.Widgets.BaseWidget} parent The parent widget
     * @return {Number} Vertical offset
     */
    static middle(targetHeight, parent) {
        return ((parent.height / 2) - (targetHeight / 2));// - pad;
    }

    /**
     * Bottom Alignment
     * @static
     * @param {Number} targetHeight The widgets width
     * @param {ST.Widgets.BaseWidget} parent The parent widget
     * @return {Number} Vertical offset
     */
    static bottom(targetHeight, parent) {
        return (parent.height - targetHeight);
    }
}
