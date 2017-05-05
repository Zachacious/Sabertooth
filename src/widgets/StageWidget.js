import BaseWidget from './BaseWidget';

/**
 * The PIXI namespace
 * @external PIXI
 * @see http://pixijs.download/release/docs/index.html
 */

/**
 * Container widget that keeps a fixed width and height. Probably should only
 * be used for full screen widgets such as the apps root widget.
 * @memberof ST.Widgets
 * @extends ST.Widgets.BaseWidget
 */
export default class StageWidget extends BaseWidget {
    /**
     * @param {ST.Widgets.BaseWidget} parent The widgets parent
     * @param {Object} [options] @see ST.Widgets.BaseWidget
     */
    constructor(parent, options = {}) {
        super(parent, options);
    }

    /**
     * Calculate bounds to remain at the user
     * defined width and height of the widget
     * @override
     */
    _calculateBounds() {
        this._bounds.minX = 0;
        this._bounds.minY = 0;
        this._bounds.maxX = this._width;
        this._bounds.maxY = this._height;
    }
}
