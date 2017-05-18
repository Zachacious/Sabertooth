import EventEmitter from 'eventemitter3';
import Alignment from '.././Alignment';
import BaseWidget from '../../widgets/BaseWidget';

/**
 * The BaseLayout class is the abstract base class for all layouts.
 * @memberof ST.Layouts
 * @abstract
 */
export default class BaseLayout extends EventEmitter {
    /**
     * @param {ST.Widgets.BaseWidget} hostWidget
     * - Widget this layout belongs to
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
         * @member {ST.Widgets.BaseWidget}
         * @private
         */
        this._host = hostWidget;

        /**
         * Holds the Alignment object
         * @member {ST.Alignment}
         */
        this.alignment = new Alignment();

        /**
         * If set to true then the layout will update on host widget
         * changes in position and size.
         * @member {Boolean}
         * @default false
         */
        this.updateOnHostChanges = false;

        /**
         * Fired when layout has finished updating
         * @event ST.Layouts.BaseLayout#updated
         */
    }

    /**
     *Override in layouts if they need to act upon the addition or
     *removal of children from the host widget.
     *@virtual
     *@private
     */
    hostChildrenChanged() {}

    /**
     * Overide in layouts - code that runs before the iteration
     * of child layouts
     * @virtual
     * @private
     */
    beginIteration() {}

    /**
     * Overide in layouts - code that runs after the iteration
     * of child layouts
     * @virtual
     * @private
     */
    endIteration() {}

    /**
     * Overide in layouts - code that sets the position of
     * each child widget.
     * @param {ST.Widgets.BaseWidget} child  the child widget in question
     * @virtual
     * @private
     */
    setChildPos(child) {}

    /**
     * Execute the layout update - iterates over child widgets
     * and executes their layouts before positioning them.
     * @private
     */
    exec() {
        this.beginIteration();
        const w = this._host;
        const len = w.children.length;
        let i = len;
        while(i--) {
            const child = w.children[len - i]; // iterate in forward order
            if(child instanceof BaseWidget) {
                child.beginBypassUpdate(); // prevents infinite loop

                    this.setChildPos(child);
                    child.layout.exec();

                child.endBypassUpdate();
            }
        }

        /* layouts execute after size policies therefor
        update is complete
         */
        w.validate(); // make sure updates stop on next loop
        w._updateClipRect(); // because things have changed

        w.emit('updated');

        this.endIteration();
    }
}
