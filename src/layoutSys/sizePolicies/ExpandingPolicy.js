import BasePolicy from './BasePolicy';
import {HORIZONTAL} from '../.././const';

/**
 * Expanding Policy causes children to expand in the given direction
 * filling the parent.
 * This Policy doesn't respect siblings - best for widgets with
 * a sigle child, or for example the hPolicy of a widget in a vertical layout.
 * @memberof ST.SizePolicies
 * @extends ST.SizePolicies.BasePolicy
 */
export default class ExpandingPolicy extends BasePolicy {
    /**
     * @param {ST.Widgets.BaseWidget} hostWidget
     * The widget this policy belongs to
     * @param {number} [orientation=HORIZONTAL] The orientation of the policy
     */
    constructor(hostWidget, orientation = HORIZONTAL) {
        super(hostWidget, orientation);

        this.updateOnHostChanges = false;

        /**
         * Fires after size is set
         * @event ST.SizePolicies.ExpandingPolicy#finished
         * @param {Number} size the size of the widget
         */
    }

    /**
     * Make connection so that the widget
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
     * Make connection so that the widget
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
     * Size widget after parent widget is finished.
     * When parent is finished we can size the widget and
     * know that parents size wont change afterward.
     */
    parentReadyH() {
        const w = this._host;
        const p = this._host.parent;
        const pad = p.padding.left + p.padding.right;

        w.width = p.width - pad;
        w.validateWidth(); // make it obey widet.min and max
        this.emit('finished', w.width);
    }

    /**
     * Size widget after parent widget is finished.
     * When parent is finished we can size the widget and
     * know that parents size wont change afterward.
     */
    parentReadyV() {
        const w = this._host;
        const p = this._host.parent;
        const pad = p.padding.top + p.padding.bottom;

        w.height = p.height - pad;
        w.validateHeight(); // make it obey widet.min and max
        this.emit('finished', w.height);
    }
}
