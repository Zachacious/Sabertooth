/*
    fixedPolicy.js
 */

import {HORIZONTAL} from '../.././const';
import BasePolicy from './BasePolicy';

/**
 * The simplest policy - Fixed uses user defined size
 * @memberof UI.SizePolicies
 * @extends UI.SizePolicies.BasePolicy
 */
export default class FixedPolicy extends BasePolicy {
    /**
     * @param {UI.Widgets.BaseWidget} hostWidget
     * - the widget this policy belongs to
     * @param {number} [orientation=HORIZONTAL] - the orientation of the policy
     */
    constructor(hostWidget, orientation = HORIZONTAL) {
        super(hostWidget, orientation);

        /**
         * If set to true the policy will update on changes to
         * the parent widgets size and position.
         * Should be true for Fixed policy
         * @type {Boolean}
         * @protected
         */
        this.updateOnHostChanges = true;
    }

    /**
     * Overridden from parent class -  only validates size
     * @override
     */
    sizeWidgetHorizontal() {
        this.validateWidth(); // make obey widget.min and max
        this.emit('finished', this._host.width);
    }

    /**
     * Overridden from parent class -  only validates size
     * @override
     */
    sizeWidgetVertical() {
        this.validateHeight(); // make obey widget.min and max
        this.emit('finished', this._host.height);
    }
}
