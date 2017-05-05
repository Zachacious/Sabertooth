import Panel from './Panel';
import Alignment from '../layoutSys/Alignment';
import Theme from '.././Theme';

/**
 * The PIXI namespace
 * @external PIXI
 * @see http://pixijs.download/release/docs/index.html
 */

/* Add widget style to ST.Theme.defaults. This way the widget
will always have a style even if the given theme doesn't have one
specifically for it. All widgets that have themable elements
should call this method before describing their class.*/
Theme.registerDefaultWidgetStyle('button', {
    enabled: 0x363636,
    disabled: 0x2e2e2e,
    hover: 0x264e26,
    click: 0x3a723a,
});

/**
 * A simple button widget that is the base class for other button types.
 * @extends ST.Widgets.Panel
 * @memberof ST.Widgets
 */
export default class Button extends Panel {
    /**
     * @param {ST.Widgets.BaseWidget} parent The widgets parent
     * @param {Object} [options = Object] @see ST.Widgets.BaseWidget
     */
    constructor(parent, options = {}) {
        super(parent, options);

        this.interactive = true;

        // make alignment default to center
        this.layout.alignment.vAlign = Alignment.middle;
        this.layout.alignment.hAlign = Alignment.center;
    }

    /** @inheritdoc */
    paintDefault() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.button.enabled;
        }
    }

    /** @inheritdoc */
    paintDown() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.button.click;
        }
    }

    /** @inheritdoc */
    paintHover() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.button.hover;
        }
    }

    /** @inheritdoc */
    paintDisabled() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.button.disabled;
        }
    }
}
