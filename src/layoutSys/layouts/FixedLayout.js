import BaseLayout from './BaseLayout';

/**
 * Arranges widgets according to their user defined position.
 * @memberof ST.Layouts
 * @extends BaseLayout
 *
 * @example
 * let widget = new ST.Widgets.Button(myApp.root, {
 *  width: 100,
 *  height: 30,
 * });
 *
 * widget.layout = new ST.Layouts.FixedLayout(widget);
 */
export default class FixedLayout extends BaseLayout {
    /**
     * @param {ST.Widgets.BaseWidget} hostWidget
     * The widget this layout belongs to
     */
    constructor(hostWidget) {
        super(hostWidget);

        this.updateOnHostChanges = true;
    }


    /**
     * Sets the widgets position with offset
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
