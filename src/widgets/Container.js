import Panel from './Panel';

/**
 * Serves as a container for other widgets. Can be used to layout
 * widgets without having a background.
 * @extends ST.Widgets.Panel
 * @memberof ST.Widgets
 *
 * @example
 * let widget = new ST.Widgets.Container(myApp.root, {
 *  width: 100,
 *  height: 30,
 * });
 */
export default class Container extends Panel {
    /**
     * @param {ST.Widgets.BaseWidget} parent parent widget
     * @param {Object} [options = Object] See {@link ST.Widgets.BaseWidget}
     */
    constructor(parent, options = {}) {
        super(parent, options);
        // Containers have nothing to interact with
        this.interactive = false;
        this.sizeProxy.renderable = false;
        this.padding.setAllTo(0);
    }
}
