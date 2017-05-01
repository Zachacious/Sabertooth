
/*
    expandingPolicy.js
 */

import BasePolicy from './BasePolicy';
// import Slot from '../.././Slot';
import {HORIZONTAL} from '../.././const';

/**
 * Expanding Policy causes children to expand in the given direction
 * filling the parent.
 * Note: This Policy doesn't respect siblings - best for widgets with a s
 * a sigle child.
 * @memberof UI.SizePolicies
 * @extends UI.SizePolicies.BasePolicy
 */
export default class ExpandingPolicy extends BasePolicy {
    /**
     * @param {UI.Widgets.BaseWidget} hostWidget
     * - the widget this policy belongs to
     * @param {number} [orientation=HORIZONTAL] - the orientation of the policy
     */
    constructor(hostWidget, orientation = HORIZONTAL) {
        super(hostWidget, orientation);
    }

    /**
     * Overridden from parent class -  make connection so that the widget
     * only gets sized after the parent is sized.
     * @override
     */
    sizeWidgetHorizontal() {
        // connect slot each iteration because they are use once
        // this prevents problems when host widget changes parent
        if(this._host.parent) {
            this._host.parent.hPolicy.once('finished',
                this.parentReadyH, this);
        }
    }

    /**
     * Overridden from parent class -  make connection so that the widget
     * only gets sized after the parent is sized.
     * @override
     */
    sizeWidgetVertical() {
        if(this._host.parent) {
            this._host.parent.vPolicy.once('finished',
                this.parentReadyV, this);
        }
    }

    /**
     * Slot method to size widget after parent widget is finished.
     * Note: When parent is finished we can size the widget and
     * know that parents size wont change afterward.
     */
    parentReadyH() {
        let w = this._host;
        let p = this._host.parent;
        let pad = p.padding.left + p.padding.right;
        // this.setWidgetWidth(w, p.width - pad);
        w.width = p.width - pad;
        this.validateWidth(); // make it obey widet.min and max
        this.emit('finished', w.width);
    }

    /**
     * Slot method to size widget after parent widget is finished.
     * Note: When parent is finished we can size the widget and
     * know that parents size wont change afterward.
     */
    parentReadyV() {
        let w = this._host;
        let p = this._host.parent;
        let pad = p.padding.top + p.padding.bottom;
        // this.setWidgetHeight(w, p.height - pad);
        w.height = p.height - pad;
        this.validateHeight(); // make it obey widet.min and max
        this.emit('finished', w.height);
    }
}
