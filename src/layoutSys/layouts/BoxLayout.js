import BaseLayout from './BaseLayout';
import Point from '../.././Point';
import {HORIZONTAL} from '../.././const';
import BaseWidget from '../.././widgets/BaseWidget';

/**
 * Arrange out widgets in a straight line in one direction
 * @memberof ST.Layouts
 * @extends ST.Layouts.BaseLayout
 */
export default class BoxLayout extends BaseLayout {
    /**
     *@param {ST.Widgets.BaseWidget} hostWidget
     *The widget this layout belongs to
     *@param {number} [orientation=HORIZONTAL] Orientation of layout
     *@param {number} [spacing=4] the space between widgets in pixels
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
         * @member {number}
         */
        this.spacing = spacing;

        /**
         * Holds the offset applied to each
         * consecutive child widget's position
         * @member {Point}
         * @private
         */
        this.posOffset = new Point();

        /**
         * Total width of child widgets combined
         * @member {Number}
         * @private
         */
        this._totalChildrenWidth = 0;

        /**
         * Total height of child widgets combined
         * @member {Number}
         * @private
         */
        this._totalChildrenHeight = 0;

        /**
         * Result of the old calculation. This is the value used.
         * @member {Number}
         * @private
         */
        this._totalChildrenWidthOld = 0;

        /**
         * Result of the old calculation. This is the value used.
         * @member {Number}
         * @private
         */
        this._totalChildrenHeightOld = 0;

        /**
         * Wether child sizes have been calculted
         * @member {Boolean}
         * @private
         */
        this._totalChildrenSizeInitialized = false;

        /**
         * Fires when layout is finished
         * @event ST.Layouts.BoxLayout#finished
         */
    }

    /**
     * Calculates the total combined size of children
     * @private
     */
    initTotalChildrenSize() {
        const children = this._host.children;
        let i = children.length;
        while(i--) {
            const child = children[i];
            if(child instanceof BaseWidget) {
                this._totalChildrenWidth += child.width + this.spacing;
                this._totalChildrenHeight += child.height + this.spacing;
            }
        }

        this._totalChildrenSizeInitialized = true;
    }

    /**
     * Prepare for iteration
     * @override
     * @private
     */
    beginIteration() {
        if(!this._totalChildrenSizeInitialized) {
            this.initTotalChildrenSize();
        };
        // cache the old sizes
        this._totalChildrenWidthOld = this._totalChildrenWidth;
        this._totalChildrenHeightOld = this._totalChildrenHeight;

        // reset totals
        this._totalChildrenWidth = 0;
        this._totalChildrenHeight = 0;

        this.posOffset.set(0, 0);
    }

    /**
     * Sets childs position and calculate next offset
     * @param {ST.Widgets.BaseWidget} child - the child in question
     * @override
     */
    setChildPos(child) {
        let alignmentOffset;

        // update should already be bypassed on host so this
        // shouldn't cause an update / infinite loop
        child.position.set(this.posOffset.x, this.posOffset.y);

        // add spacing to the totals for the next one
        this._totalChildrenWidth += child.width + this.spacing;
        this._totalChildrenHeight += child.height + this.spacing;

        if(this.orientation === HORIZONTAL) {
            alignmentOffset = this.alignment.getOffset(this._host,
                this._totalChildrenWidthOld, child.height);

            // set posOffset for the next one
            this.posOffset.x += child.width + this.spacing;
        } else { // VERTICAL
            alignmentOffset = this.alignment.getOffset(this._host,
                child.width, this._totalChildrenHeightOld);

            // set posOffset for the next one
            this.posOffset.y += child.height + this.spacing;
        }

        child.x += alignmentOffset.x;
        child.y += alignmentOffset.y;

        // set the real position from the virtual
        child.applyPosition();
    }

    /**
     * Emits finished event
     * @override
     */
    endIteration() {
        this.emit('finished');
    }

    /**
     * When host widgets children change this will re-calculate the
     * total size of the children
     * @override
     */
    hostChildrenChanged() {
        this._totalChildrenSizeInitialized = false;
    }

}
