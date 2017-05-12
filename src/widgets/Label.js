import * as PIXI from 'pixi.js';
import BaseWidget from './BaseWidget';

/**
 * A simple text label
 * @memberof ST.Widgets
 * @extends ST.Widgets.BaseWidget
 */
export default class Label extends BaseWidget {
    /**
     * @param {ST.BaseWidget} parent Widgets parent
     * @param {Object} [options = Object] See {@link ST.Widgets.BaseWidget}
     * @param {String} [options.text] The text presented on the label
     */
    constructor(parent, options = {}) {
        super(parent, options);
        // default options
        const defaults = {
            text: '',
        };

        options = Object.assign(defaults, options);

        /**
         * Internal PIXI.Text object
         * @member {PIXI.Text}
         * @private
         */
        this._textObj = new PIXI.Text();
        this.addChild(this._textObj);
        this._textObj.mask = null;
        this._clipGraphic.renderable = false;
        this.paintDefault();
        this.text = options.text;

        /**
         * Fires when the text is changed
         * @event ST.Widgets.Label#textChanged
         */
    }

    /** @inheritdoc */
    paintDefault() {
        if(this._textObj) {
            this._textObj.style = this.theme.fontStyles.enabled;
        }
    }

    /** @inheritdoc */
    paintDown() {
        if(this._textObj) {
            this._textObj.style = this.theme.fontStyles.click;
        }
    }

    /** @inheritdoc */
    paintHover() {
        if(this._textObj) {
            this._textObj.style = this.theme.fontStyles.hover;
        }
    }

    /** @inheritdoc */
    paintDisabled() {
        if(this._textObj) {
            this._textObj.style = this.theme.fontStyles.disabled;
        }
    }

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
