/*
    Button.js
 */

import Panel from './Panel';
import Alignment from '../layoutSys/Alignment';
import Theme from '.././Theme';

Theme.registerDefaultWidgetStyle('button', {
    enabled: 0x363636,
    disabled: 0x2e2e2e,
    hover: 0x264e26,
    click: 0x3a723a,
});

/**
 * Simple button widget
 * @extends UI.Widgets.Panel
 * @memberof UI.Widgets
 */
export default class Button extends Panel {
    /**
     * @inheritdoc
     */
    constructor(parent, options) {
        super(parent, options);

        this.interactive = true;

        this.layout.alignment.vAlign = Alignment.middle;
        this.layout.alignment.hAlign = Alignment.center;
    }

    /**
     * @inheritdoc
     */
    paintDefault() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.button.enabled;
        }
    }

    /**
     * @inheritdoc
     */
    paintDown() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.button.click;
        }
    }

    /**
     * @inheritdoc
     */
    paintHover() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.button.hover;
        }
    }

    /**
     * @inheritdoc
     */
    paintDisabled() {
        if(this._bkgObj) {
            this._bkgObj.texture = this.theme.textures.button.disabled;
        }
    }
}
