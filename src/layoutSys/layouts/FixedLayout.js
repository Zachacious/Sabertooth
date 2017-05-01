/*
    fixedLayout.js
 */

import BaseLayout from './BaseLayout';

/**
 * Simple layout - makes no changes
 * @memberof UI.Layouts
 * @extends BaseLayout
 */
export default class FixedLayout extends BaseLayout {
    /**
     * @param {UI.Widgets.BaseWidget} hostWidget
     * - The widget this layout belongs to
     */
    constructor(hostWidget) {
        super(hostWidget);

        /**
         * If set to true then the layout will update on host widget
         * changes in position and size.
         * @member {Boolean}
         * @protected
         * @default true
         */
        this.updateOnHostChanges = true;
    }


    /**
     * Overidden from parent - apply childs position
     * @param {UI.Widgets.BaseWidget} child - the child in question
     * @override
     */
    setChildPos(child) {
        // let host = this._host;
        let alignOffset = this.alignment.getOffset(this._host,
            child.width, child.height);
        // let x = child.x + alignOffset.x;
        // let y = child.y + alignOffset.y;

        // child.position.set(x, y);
        child.applyPosition(alignOffset.x, alignOffset.y);

        this.emit('finished');
    }
}
