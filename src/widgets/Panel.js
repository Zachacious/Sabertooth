import BaseWidget from './BaseWidget';
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
Theme.registerDefaultWidgetStyle('panel', {
    enabled: 0x2b2b2b,
    disabled: 0x272727,
    hover: 0x244c24,
    click: 0x387038,
});

/**
 * Panels are simple rectangle widgets that contain other widgets.
 * @memberof ST.Widgets
 * @extends ST.Widgets.BaseWidget
 */
export default class Panel extends BaseWidget {
    /**
     * @param {ST.Widgets.BaseWidget} parent The widgets parent
     * @param {Object} [options] @see ST.Widgets.BaseWidget
     */
    constructor(parent, options) {
        super(parent, options);

        /**
         * Internal background sprite
         * @member {PIXI.Sprite}
         * @private
         */
        this._bkgObj = new PIXI.Sprite(this.theme.texture);
        this.addChild(this._bkgObj);
        this._bkgObj.width = this.width;
        this._bkgObj.height = this.height;

        this.sizeProxy = this._bkgObj;

        this.paintDefault();
    }

    /** @inheritdoc */
    paintDefault() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.panel.enabled;
        }
    }

    /** @inheritdoc */
    paintDisabled() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.panel.disabled;
        }
    }

    /** @inheritdoc */
    paintHover() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.panel.hover;
        }
    }

    /** @inheritdoc */
    paintDown() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.panel.click;
        }
    }

}
