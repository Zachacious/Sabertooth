/*
    BaseLayout.js
 */

import EventEmitter from 'eventemitter3';
import Alignment from '.././Alignment';
import BaseWidget from '../../widgets/BaseWidget';

/**
 * The BaseLayout class is the abstract base class for all layouts.
 * @memberof UI.Layouts
 * @abstract
 */
export default class BaseLayout extends EventEmitter {
    /**
     * @param {UI.Widgets.BaseWidget} hostWidget
     * - The widget this layout belongs to
     */
    constructor(hostWidget) {
        super();
        // make sure we have a host widget
        if(!hostWidget) {
            throw new Error('Layouts must be created ' +
            'with a valid host widget parameter');
        }

        /**
         * The internal reference to the host widget
         * @member {UI.Widgets.BaseWidget}
         * @private
         */
        this._host = hostWidget;

        /**
         * Holds the Alignment object
         * @member {UI.Alignment}
         */
        this.alignment = new Alignment();

        /**
         * If set to true then the layout will update on host widget
         * changes in position and size.
         * @member {Boolean}
         * @protected
         * @default false
         */
        this.updateOnHostChanges = false;
    }

    /**
     *Override in layouts if they need to act upon the addition or
     *removal of children from the host widget.
     *@virtual
     */
    hostChildrenChanged() {}

    /**
     * Overide in layouts - code that runs before the iteration
     * of child layouts
     * @virtual
     */
    beginIteration() {}

    /**
     * Overide in layouts - code that sets the position of
     * each child widget.
     * @param {UI.Widgets.BaseWidget} child - the child widget in question
     * @virtual
     */
    setChildPos(child) {}

    /**
     * Execute the layout update - iterates over child widgets
     * and executes their layouts before positioning them.
     */
    exec() {
        this.beginIteration();
        let w = this._host;
        let len = w.children.length;
        let i = len;
        while(i--) {
            let child = w.children[len - i]; // iterate in forward order
            if(child instanceof BaseWidget) {
                child.beginBypassUpdate();

                    this.setChildPos(child);
                    child.layout.exec();

                child.endBypassUpdate();
            }
        }

        // reset update request on host widget
        w.validate();
        w._updateClipGraphic();
        w.emit('layoutUpdated');
    }
}
