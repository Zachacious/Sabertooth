import BaseWidget from '../../widgets/BaseWidget';
import EventEmitter from 'eventemitter3';
import {HORIZONTAL} from '../.././const';

/**
 * Abstract base class for all size policies
 * @memberof ST.SizePolicies
 * @abstract
 */
export default class BasePolicy extends EventEmitter {
    /**
     * @param {ST.Widgets.BaseWidget} hostWidget
     * The widget this policy belongs to
     * @param {number} [orientation=HORIZONTAL] The orientation of the policy
     */
    constructor(hostWidget, orientation = HORIZONTAL) {
        super();
        // make sure we have a host
        if(!hostWidget) {
            throw new Error('SizePolicy must be created ' +
            'with a valid host widget parameter');
        }

        /**
         * The orientation of the policy
         * @member {number}
         */
        this.orientation = orientation;

        /**
         * The widget this policy belongs to
         * @member {ST.Widgets.BaseWidget}
         * @private
         */
        this._host = hostWidget;

        /**
         * Combined size of child widgets who have finished
         * executing their size policy
         * @member {Number}
         * @private
         */
        this.totalChildrenFinishedSize = 0;

        /**
         * Count of child widgets who have finished
         * executing their size policy
         * @member {Number}
         * @private
         */
        this.totalChildrenFinished = 0;

        /**
         * If set to true the policy will update on changes to
         * the parent widgets size and position
         * @member {Boolean}
         * @default false
         * @private
         */
        this.updateOnHostChanges = false;

        /**
         * Total space used by children widgets
         * @member {Number}
         * @private
         */
        this.usedSpace = 0;

        /**
         * Keeps track of the spacing in the current layout
         * @member {Number}
         * @private
         */
        this.layoutSpacing = 0;

        /**
         * Fires when iteration of children begins
         * @event ST.SizePolicies.BasePolicy#preIteration
         */

         /**
          * Fires when iteration of children ends
          * @event ST.SizePolicies.BasePolicy#postIteration
          */
    }

    /**
     * Handles sizing the widget if HORIZONTAL orientation
     * @virtual
     */
    sizeWidgetHorizontal() {}

    /**
     * Handles sizing the widget if VERTICAL orientation
     * @virtual
     */
    sizeWidgetVertical() {}

    /**
     * As each child widgets policy finishes we count them and
     * add their sizes to the collective
     * @param {number} size - Size of the child passed in
     * @private
     */
    childPolicyFinished(size = 0) {
        this.totalChildrenFinishedSize += size + this.layoutSpacing;
        this.usedSpace += size + this.layoutSpacing;
        this.totalChildrenFinished -= 1;
    }

    /**
     * Execute the policy update - iterate over  and execute
     * children widgets policies.
     * @private
     */
    exec() {
        this.emit('preIteration');
        let w = this._host;
        let len = w.children.length;
        let i = len;
        // because some layouts don't have spacing (FixedLayout)
        if('spacing' in this._host.layout) {
            this.layoutSpacing = this._host.layout.spacing;
        }
        this.usedSpace = 0 - this.layoutSpacing;
        // counts down instead of up
        this.totalChildrenFinished = len - 1;
        this.totalChildrenFinishedSize = 0 - this.layoutSpacing;

        while(i--) {
            const child = w.children[i];
            if(this.orientation === HORIZONTAL) {
                if(child instanceof BaseWidget) {
                    // prevents infinite loop caused by updating each loop
                    child.beginBypassUpdate();
                        child.hPolicy.once('finished',
                            this.childPolicyFinished, this);
                        child.hPolicy.exec();
                    child.endBypassUpdate();
                }
            } else {
                if(child instanceof BaseWidget) {
                    // prevents infinite loop caused by updating each loop
                    child.beginBypassUpdate();
                        child.vPolicy.once('finished',
                            this.childPolicyFinished, this);
                        child.vPolicy.exec();
                    child.endBypassUpdate();
                }
            }
        }


        if(this.orientation === HORIZONTAL) {
            this.sizeWidgetHorizontal();
        } else { // VERTICAL
            this.sizeWidgetVertical();
        }

        this.emit('postIteration');
    }
}
