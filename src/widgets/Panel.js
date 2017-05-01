/*
    Panel.js
 */

import BaseWidget from './BaseWidget';
import Theme from '.././Theme';

Theme.registerDefaultWidgetStyle('panel', {
    enabled: 0x2b2b2b,
    disabled: 0x272727,
    hover: 0x244c24,
    click: 0x387038,
});

/**
 * Simple panel container widget
 * @memberof UI.Widgets
 * @extends UI.Widgets.BaseWidget
 */
export default class Panel extends BaseWidget {
    /**
     * @inheritdoc
     */
    constructor(parent, options) {
        super(parent, options);

        this._bkgObj = new PIXI.Sprite(this.theme.texture);
        this.addChild(this._bkgObj);
        this._bkgObj.width = this.width;
        this._bkgObj.height = this.height;

        this.sizeProxy = this._bkgObj;

        // this.idealThemeFrameNode = 'panel';
        // this.updateThemeTextureRoot();

        this.paintDefault();
    }

    /**
     * @inheritdoc
     */
    paintDefault() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.panel.enabled;
        }
    }

    /**
     * @inheritdoc
     */
    paintDisabled() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.panel.disabled;
        }
    }

    /**
     * @inheritdoc
     */
    paintHover() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.panel.hover;
        }
    }

    /**
     * @inheritdoc
     */
    paintDown() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.panel.click;
        }
    }

}
