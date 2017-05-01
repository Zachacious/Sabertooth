import Panel from './Panel';

/**
 * Container for other widgets
 * @extends UI.Widgets.Panel
 * @memberof UI.Widgets
 */
export default class Container extends Panel {
    /**
     * @param {UI.Widgets.BaseWidget} parent parent widget
     * @param {Object} [options]
     */
    constructor(parent, options) {
        super(parent, options);
        this.sizeProxy.renderable = false;
        this.padding.setAllTo(0);
    }
}
