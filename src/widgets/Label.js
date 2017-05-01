/*
    Label.js
 */

import * as PIXI from 'pixi.js';
import BaseWidget from './BaseWidget';

/**
 * Simple Label widget class
 * @memberof UI.Widgets
 */
export default class Label extends BaseWidget {
    /**
     * @param {UI.BaseWidget} parent - widgets parent
     * @param {String} text - the text presented on the label
     * @param {Object} options - optional parameters
     * @param {UI.Theme} options.theme - Theme for this widget -
     * defaults to current theme
     * @param {Number} [options.x=0] - x position
     * @param {Number} [options.y=0] - y position
     * @param {Number} [options.width=0] - widget's width
     * @param {Number} [options.height=0] - widget's height
     * @param {Number} [options.minWidth=0] - min width allowed
     * @param {Number} [options.minHeight=0] - min height allowed
     * @param {Number} [options.maxWidth=10000] - max width allowed
     * @param {Number} [options.maxHeight=10000] - max height allowed
     * @param {Number} [options.padTop=4] -top padding
     * @param {Number} [options.padLeft=4] -left padding
     * @param {Number} [options.padBottom=4] -bottom padding
     * @param {Number} [options.padRight=4] -right padding
     */
    constructor(parent, text = '', options) {
        super(parent, options);

        /**
         * Internal Pixi text object
         * @type {PIXI.Text}
         * @private
         */
        this._textObj = new PIXI.Text();
        // this.sizeProxy = this._textObj;
        this.addChild(this._textObj);
        this._textObj.mask = null;
        this._clipGraphic.renderable = false;
        this.paintDefault();
        this.text = text;
        // this.color = PIXI.utils.hex2rgb(0xffffff);
    }

    /**
     * Sets text styling
     * @protected
     */
    paintDefault() {
        if(this._textObj) {
            this._textObj.style = this.theme.fontStyles.enabled;
        }
    }

    /**
     * TODO
     */
    paintDown() {
        if(this._textObj) {
            this._textObj.style = this.theme.fontStyles.click;
        }
    }

    /**
     * TODO
     */
    paintHover() {
        if(this._textObj) {
            this._textObj.style = this.theme.fontStyles.hover;
        }
    }

    /**
     * TODO
     */
    paintDisabled() {
        if(this._textObj) {
            this._textObj.style = this.theme.fontStyles.disabled;
        }
    }

    // properties ---

    /**
     * The text presented by the label
     * @member {String}
     */
    get text() {
        return this._textObj.text;
    }

    set text(val) { // eslint-disable-line require-jsdoc
        this._textObj.text = val;
        this.width = this._textObj.width;
        this.height = this._textObj.height;
        this._updateClipGraphic();
        this.emit('textChanged', val);
    }

}
