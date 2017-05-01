/*
    BasePolicy.js
 */

import BaseWidget from '../../widgets/BaseWidget';
import EventEmitter from 'eventemitter3';
import {HORIZONTAL} from '../.././const';

/**
 * Abstract base class for all size policies
 * @memberof UI.SizePolicies
 * @abstract
 */
export default class BasePolicy extends EventEmitter {
    /**
     * @param {UI.Widgets.BaseWidget} hostWidget
     * - the widget this policy belongs to
     * @param {number} [orientation=HORIZONTAL] - the orientation of the policy
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
         * @type {number}
         */
        this.orientation = orientation;

        /**
         * The widget this policy belongs to
         * @type {UI.Widgets.BaseWidget}
         * @private
         */
        this._host = hostWidget;

        /**
         * Combined size of child widgets who have finished
         * executing their size policy
         * @type {Number}
         * @protected
         */
        this.totalChildrenFinishedSize = 0;

        /**
         * Count of child widgets who have finished
         * executing their size policy
         * @type {Number}
         * @protected
         */
        this.totalChildrenFinished = 0;

        /**
         * If set to true the policy will update on changes to
         * the parent widgets size and position
         * @type {Boolean}
         * @protected
         */
        this.updateOnHostChanges = false;

        this.usedSpace = 0;

        this.layoutSpacing = 0;
    }

    // /**
    //  * Sets widgets width in a direct way as to avoid updating
    //  * the policy infinitely
    //  * @param {UI.Widgets.BaseWidget} widget - the widget in question
    //  * @param {number} value - the width to set
    //  * @return {Number} the width
    //  */
    // setWidgetWidth(widget, value) {
    //     const width = widget.sizeProxy.getLocalBounds().width;
    //     if (width !== 0) {
    //         widget.sizeProxy.scale.x = value / width;
    //     } else {
    //         widget.sizeProxy.scale.x = 1;
    //     }
    //     widget.sizeProxy._width = value;
    //     return widget.sizeProxy._width;
    // }
    //
    // /**
    //  * Sets widgets height in a direct way as to avoid updating
    //  * the policy infinitely
    //  * @param {UI.Widgets.BaseWidget} widget - the widget in question
    //  * @param {number} value - the width to set
    //  * @return {Number} the height
    //  */
    // setWidgetHeight(widget, value) {
    //     const height = widget.sizeProxy.getLocalBounds().height;
    //     if (height !== 0) {
    //         widget.sizeProxy.scale.y = value / height;
    //     } else {
    //         widget.sizeProxy.scale.y = 1;
    //     }
    //     widget.sizeProxy._height = value;
    //     return widget.sizeProxy._height;
    // }

    /**
     * Makes sure the host widgets width stay between min and max
     * @return {Number} the width
     */
    validateWidth() {
        let w = this._host;
        w.width = Math.min(Math.max(w.width, w.min.width), w.max.width);
        // this.setWidgetWidth(w, Math.min(Math.max(w.width, w.min.width),
        //     w.max.width));
        return w.width;
        // if(w.width > w.max.width) this.setWidgetWidth(w, w.max.width);
        // if(w.width < w.min.width) this.setWidgetWidth(w, w.min.width);
    }

    /**
     * Makes sure the host widgets height stay between min and max
     * @return {Number} the height
     */
    validateHeight() {
        let w = this._host;
        w.height = Math.min(Math.max(w.height, w.min.height), w.max.height);
        // this.setWidgetHeight(w, Math.min(Math.max(w.height, w.min.height),
        //     w.max.height));
        return w.height;
        // if(w.height > w.max.height) this.setWidgetHeight(w, w.max.height);
        // if(w.height < w.min.height) this.setWidgetHeight(w, w.min.height);
    }

    /**
     * Overide - sizes the widget if HORIZONTAL orientation
     * @virtual
     */
    sizeWidgetHorizontal() {
        // subclasses override this function
    }

    /**
     * Overide - sizes the widget if VERTICAL orientation
     * @virtual
     */
    sizeWidgetVertical() {
        // subclasses override this function
    }

    /**
     * As each child widgets policy finishes we count them and
     * add their sizes to the collective
     * @param {number} size - passed in via each child widgets policy
     */
    childPolicyFinished(size = 0) {
        // let spacing = 0;
        // if('spacing' in this._host.layout) {
        //     spacing = this._host.layout.spacing;
        // }
        this.totalChildrenFinishedSize += size + this.layoutSpacing;
        this.usedSpace += size + this.layoutSpacing;
        this.totalChildrenFinished -= 1;
    }

    /**
     * Execute the policy update - iterate over  and execute
     * children widgets policies.
     * Note: recursive method
     */
    exec() {
        this.emit('preIteration');
        let w = this._host;
        let len = w.children.length;
        let i = len;
        if('spacing' in this._host.layout) {
            this.layoutSpacing = this._host.layout.spacing;
        }
        this.usedSpace = 0 - this.layoutSpacing;
        this.totalChildrenFinished = len - 1;
        this.totalChildrenFinishedSize = 0 - this.layoutSpacing;

        while(i--) {
            let child = w.children[i];
            if(this.orientation === HORIZONTAL) {
                if(child instanceof BaseWidget) {
                    child.beginBypassUpdate();
                        child.hPolicy.once('finished',
                            this.childPolicyFinished, this);
                        child.hPolicy.exec();
                    child.endBypassUpdate();
                }
            } else {
                if(child instanceof BaseWidget) {
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
