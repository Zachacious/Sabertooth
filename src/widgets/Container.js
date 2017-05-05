import Panel from './Panel';

/**
 * The PIXI namespace
 * @external PIXI
 * @see http://pixijs.download/release/docs/index.html
 */

/**
 * Serves as a container for other widgets. Can be used to layout
 * widgets without having a background.
 * @extends ST.Widgets.Panel
 * @memberof ST.Widgets
 */
export default class Container extends Panel {
    /**
     * @param {ST.Widgets.BaseWidget} parent parent widget
     * @param {Object} [options = Object] @see ST.Widgets.BaseWidget
     */
    constructor(parent, options = {}) {
        super(parent, options);
        this.sizeProxy.renderable = false;
        this.padding.setAllTo(0);
    }
}
