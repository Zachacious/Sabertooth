import ExpandingPolicy from './ExpandingPolicy';
import {HORIZONTAL, VERTICAL} from '../.././const';

/**
 * Expands widgets into their parent while sharing space with their siblings.
 * @memberof ST.SizePolicies
 * @extends ST.SizePolicies.ExpandingPolicy
 *
 * @example
 * let widget = new ST.Widgets.Button(myApp.root, {
 *  width: 100,
 *  height: 30,
 * });
 *
 * widget.hPolicy = new ST.SizePolicies
 *  .SharedExpandingPolicy(widget, ST.HORIZONTAL);
 *
 * widget.vPolicy = new ST.SizePolicies
 *  .SharedExpandingPolicy(widget, ST.VERTICAL);
 */
export default class SharedExpandingPolicy extends ExpandingPolicy {
    /**
     * @param {ST.Widgets.BaseWidget} hostWidget
     * The widget this policy belongs to
     * @param {number} [orientation=HORIZONTAL] The orientation of the policy
     */
    constructor(hostWidget, orientation = HORIZONTAL) {
        super(hostWidget, orientation);

        /**
         * Fires after size has been set
         * @event ST.SizePolicies.SharedExpandingPolicy#finished
         * @param {Number} size the size of the widget
         */
    }

    /**
     * Size widget after parent widget is finished.
     * Note: When parent is finished we can size the widget and
     * know that parents size wont change afterward.
     * @override
     */
    parentReadyH() {
        const w = this._host;
        const parent = w.parent;
        const pad = parent.padding.left + parent.padding.right;
        const p = parent.hPolicy;
        const remaining = p.totalChildrenFinished - 1;
        const availableSpace
            = (parent.width - p.totalChildrenFinishedSize) - pad;
        let size;

        // because some layouts dont need an orientation
        if('orientation' in parent.layout &&
            parent.layout.orientation === VERTICAL) {
                size = parent.width - pad;
                w.width = size;
                w.validateWidth(); // obey widget min and max size
            } else {
                size = availableSpace / remaining;
                w.width = size;
                // obey widget min and max size
                let vWidth = w.validateWidth();
                if(vWidth === w.width) {
                    p.once('postIteration', this.consumeUnusedSpaceH, this);
                }
            }

        this.emit('finished', w.width);
    }

    /**
     * Size widget after parent widget is finished.
     * Note: When parent is finished we can size the widget and
     * know that parents size wont change afterward.
     * @override
     */
    parentReadyV() {
        const w = this._host;
        const parent = w.parent;
        const pad = parent.padding.top + parent.padding.bottom;
        const p = parent.vPolicy;
        const remaining = p.totalChildrenFinished - 1;
        const availableSpace =
            (parent.height - p.totalChildrenFinishedSize ) - pad;
        let size;

        // because some layouts dont need an orientation
        if('orientation' in parent.layout &&
            parent.layout.orientation === HORIZONTAL) {
                size = parent.height - pad;
                w.height = size;
                w.validateHeight(); // obey widget min and max size
            } else {
                size = availableSpace / remaining;
                w.height = size;
                // obey widget min and max size
                let vHeight = w.validateHeight();
                if(vHeight === w.height) {
                     p.once('postIteration', this.consumeUnusedSpaceV, this);
                }
            }
        this.emit('finished', w.height);
    }

    /**
     * Make sure widget gets its share of unused space after all of siblings
     * have been sized
     * @callback
     */
    consumeUnusedSpaceH() {
        const w = this._host;
        const parent = w.parent;
        const unusedSpace = parent.width - parent.hPolicy.usedSpace;

        // every widget listens to the postIteration event so use that
        // to get a count on remaining widgets
        const remaining = parent.hPolicy.listeners('postIteration')
            .filter((value)=>{
                return value.name === this.consumeUnusedSpaceH.name;
            });
        const pad = parent.padding.left + parent.padding.right;
        const relSize = (unusedSpace / (remaining.length+1)) - pad;

        // set the newly adjusted size
        w.width += relSize;
        w.validateWidth(); // obey widget min and max size

        // add used space back
        parent.hPolicy.usedSpace += relSize;
    }

    /**
     * Make sure widget gets its share of unused space after all of siblings
     * have been sized
     * @callback
     */
    consumeUnusedSpaceV() {
        const w = this._host;
        const parent = w.parent;
        const unusedSpace = parent.height - parent.vPolicy.usedSpace;

        // every widget listens to the postIteration event so use that
        // to get a count on remaining widgets
        const remaining = parent.vPolicy.listeners('postIteration')
            .filter((value)=>{
                return value.name === this.consumeUnusedSpaceV.name;
            });
        const pad = parent.padding.top + parent.padding.bottom;
        const relSize = (unusedSpace / (remaining.length+1)) - pad;

        // set the newly adjusted size
        w.height += relSize;
        w.validateHeight();// obey widget min and max size

        // add used space back
        parent.vPolicy.usedSpace += relSize;
    }
}
