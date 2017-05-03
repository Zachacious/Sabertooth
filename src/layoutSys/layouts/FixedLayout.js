import BaseLayout from './BaseLayout';

/**
 * Simple layout - makes no changes
 * @memberof ST.Layouts
 * @extends BaseLayout
 */
export default class FixedLayout extends BaseLayout {
    /**
     * @param {ST.Widgets.BaseWidget} hostWidget
     * The widget this layout belongs to
     */
    constructor(hostWidget) {
        super(hostWidget);

        // TODO check docs to see if this works
        /**
         * @override
         */
        this.updateOnHostChanges = true;
    }


    /**
     * Simply sets the widgets position with offset
     * @param {ST.Widgets.BaseWidget} child - the child in question
     * @override
     */
    setChildPos(child) {
        const alignOffset = this.alignment.getOffset(this._host,
            child.width, child.height);

        child.applyPosition(alignOffset.x, alignOffset.y);
    }

    /** @inheritdoc */
    endIteration() {
        this.emit('finished');
    }
}
