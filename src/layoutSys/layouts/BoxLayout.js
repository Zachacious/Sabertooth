/*
    BoxLayout.js
 */

import BaseLayout from './BaseLayout';
import Point from '../.././point';
import {HORIZONTAL} from '../.././const';
import BaseWidget from '../.././widgets/BaseWidget';

/**
 * Lays out widgets in a straight line in one direction
 * @memberof UI.Layouts
 * @extends UI.Layouts.BaseLayout
 */
export default class BoxLayout extends BaseLayout {
    /**
     *@param {UI.Widgets.BaseWidget} hostWidget
     *- The widget this layout belongs to
     *@param {number} [orientation=HORIZONTAL] - Orientation of layout
     *@param {number} [spacing=4] - the space between widgets in pixels
     */
    constructor(hostWidget, orientation = HORIZONTAL, spacing = 4) {
        super(hostWidget);

        /**
         * Orientation of the layout
         * @member {number}
         */
        this.orientation = orientation;

        /**
         * The space between widgets in pixels
         * @type {number}
         */
        this.spacing = spacing;

        /**
         * Used internally - to hold the offset applied to each
         * consecutive child widget's position
         * @member {Point}
         * @protected
         */
        this.posOffset = new Point();

        /**
         * Total width of child widgets combined
         * @type {Number}
         * @protected
         */
        this._totalChildrenWidth = 0;

        /**
         * Total height of child widgets combined
         * @type {Number}
         * @protected
         */
        this._totalChildrenHeight = 0;

        /**
         * Result of the old calculation. This is the value used.
         * @type {Number}
         * @protected
         */
        this._totalChildrenWidthOld = 0;

        /**
         * Result of the old calculation. This is the value used.
         * @type {Number}
         * @protected
         */
        this._totalChildrenHeightOld = 0;

        /**
         * Wether child sizes have been calculted
         * @type {Boolean}
         * @private
         */
        this._totalChildrenSizeInitialized = false;
    }

    /**
     * Calculates the total combined size of children
     */
    initTotalChildrenSize() {
        let children = this._host.children;
        let i = children.length;
        while(i--) {
            let child = children[i];
            if(child instanceof BaseWidget) {
                this._totalChildrenWidth += child.width + this.spacing;
                this._totalChildrenHeight += child.height + this.spacing;
            }
        }

        this._totalChildrenSizeInitialized = true;
    }

    /**
     * Overidden from BaseLayout - prepare for iteration
     * @override
     */
    beginIteration() {
        this._totalChildrenWidthOld = this._totalChildrenWidth;
        this._totalChildrenHeightOld = this._totalChildrenHeight;

        this._totalChildrenWidth = 0; // this._host.padding.left;
        this._totalChildrenHeight = 0; // this._host.padding.top;

        if(!this._totalChildrenSizeInitialized) {
            this.initTotalChildrenSize();

            this._totalChildrenWidthOld = this._totalChildrenWidth;
            this._totalChildrenHeightOld = this._totalChildrenHeight;

            this._totalChildrenWidth = 0; // this._host.padding.left;
            this._totalChildrenHeight = 0; // this._host.padding.top;
        };
        // this.posOffset.x = this._host.padding.left;
        // this.posOffset.y = this._host.padding.top;
        this.posOffset.set(0, 0);
    }

    /**
     * Overidden from parent - set childs position and calculate next offset
     * @param {UI.Widgets.BaseWidget} child - the child in question
     * @override
     */
    setChildPos(child) {
        let alignmentOffset;

        // set position in a direct way to avoid infinite loop
        // by calling layout update
        child.position.set(this.posOffset.x, this.posOffset.y);

        this._totalChildrenWidth += child.width + this.spacing;
        this._totalChildrenHeight += child.height + this.spacing;

        if(this.orientation === HORIZONTAL) {
            alignmentOffset = this.alignment.getOffset(this._host,
                this._totalChildrenWidthOld, child.height);

            this.posOffset.x += child.width + this.spacing;
        } else {
            alignmentOffset = this.alignment.getOffset(this._host,
                child.width, this._totalChildrenHeightOld);

            this.posOffset.y += child.height + this.spacing;
        }

        child.x += alignmentOffset.x;
        child.y += alignmentOffset.y;

        child.applyPosition();

        this.emit('finished');
    }

    /**
     * When host widgets children change we need to re-calculate
     * total size of children
     * @override
     */
    hostChildrenChanged() {
        this._totalChildrenSizeInitialized = false;
    }

}
