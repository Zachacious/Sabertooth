/*
sharedExpandingPolicy.js
 */

import ExpandingPolicy from './ExpandingPolicy';
import {HORIZONTAL, VERTICAL} from '../.././const';

/**
 * Like Expanding Policy except that it shares space with its siblings.
 * @memberof UI.SizePolicies
 * @extends UI.SizePolicies.ExpandingPolicy
 */
export default class SharedExpandingPolicy extends ExpandingPolicy {
    /**
     * @param {UI.Widgets.BaseWidget} hostWidget
     * - the widget this policy belongs to
     * @param {number} [orientation=HORIZONTAL] - the orientation of the policy
     */
    constructor(hostWidget, orientation = HORIZONTAL) {
        super(hostWidget, orientation);
    }

    /**
     * Overidden from parent -
     * Slot method to size widget after parent widget is finished.
     * Note: When parent is finished we can size the widget and
     * know that parents size wont change afterward.
     * @override
     */
    parentReadyH() {
        let w = this._host;
        let parent = w.parent;
        let pad = parent.padding.left + parent.padding.right;
        let p = parent.hPolicy;
        let remaining = p.totalChildrenFinished - 1;
        let availableSpace = (parent.width - p.totalChildrenFinishedSize) - pad;
        let size; // = availableSpace / remaining;

        if('orientation' in parent.layout &&
            parent.layout.orientation === VERTICAL) {
                size = parent.width - pad;
                w.width = size;
                // this.setWidgetWidth(w, size);
                this.validateWidth();
            } else {
                size = availableSpace / remaining;
                w.width = size;
                // this.setWidgetWidth(w, size);
                let vWidth = this.validateWidth();
                // p.usedSpace += w.width;
                if(vWidth === w.width) {
                    p.once('postIteration', this.consumeUnusedSpaceH, this);
                }
            }
        // } else {
        //     size = availableSpace / remaining;
        // }
        this.emit('finished', w.width);
    }

    /**
     * Overidden from parent -
     * Slot method to size widget after parent widget is finished.
     * Note: When parent is finished we can size the widget and
     * know that parents size wont change afterward.
     * @override
     */
    parentReadyV() {
        let w = this._host;
        let parent = w.parent;
        let pad = parent.padding.top + parent.padding.bottom;
        let p = parent.vPolicy;
        let remaining = p.totalChildrenFinished - 1;
        let availableSpace =
            (parent.height - p.totalChildrenFinishedSize ) - pad;
        let size; // = availableSpace / remaining;

        if('orientation' in parent.layout &&
            parent.layout.orientation === HORIZONTAL) {
                size = parent.height - pad;
                w.height = size;
                // this.setWidgetHeight(w, size);
                this.validateHeight();
            } else {
                size = availableSpace / remaining;
                w.height = size;
                // this.setWidgetHeight(w, size);
                let vHeight = this.validateHeight();
                // p.usedSpace += w.height;
                if(vHeight === w.height) {
                     p.once('postIteration', this.consumeUnusedSpaceV, this);
                }
            }
        // } else {
        //     size = availableSpace / remaining;
        // }
        this.emit('finished', w.height);
    }

    /**
     * Make sure widget gets its share of unused space after all of siblings
     * have been sized
     * @callback
     */
    consumeUnusedSpaceH() {
        let w = this._host;
        let parent = w.parent;
        let unusedSpace = parent.width - parent.hPolicy.usedSpace;
        let remaining = parent.hPolicy.listeners('postIteration')
        .filter((value)=>{
            return value.name === this.consumeUnusedSpaceH.name;
        });
        let pad = parent.padding.left + parent.padding.right;
        let relSize = (unusedSpace / (remaining.length+1)) - pad;
        w.width += relSize;
        // this.setWidgetWidth(w, w.width + relSize);
        this.validateWidth();
        parent.hPolicy.usedSpace += relSize;
    }

    /**
     * Make sure widget gets its share of unused space after all of siblings
     * have been sized
     * @callback
     */
    consumeUnusedSpaceV() {
        let w = this._host;
        let parent = w.parent;
        let unusedSpace = parent.height - parent.vPolicy.usedSpace;
        let remaining = parent.vPolicy.listeners('postIteration')
        .filter((value)=>{
            return value.name === this.consumeUnusedSpaceV.name;
        });
        let pad = parent.padding.top + parent.padding.bottom;
        let relSize = (unusedSpace / (remaining.length+1)) - pad;
        w.height += relSize;
        // this.setWidgetHeight(w, w.height + relSize);
        this.validateHeight();
        parent.vPolicy.usedSpace += relSize;
    }
}
