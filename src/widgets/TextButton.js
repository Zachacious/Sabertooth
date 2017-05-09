import Button from './Button';
import Label from './Label';

/**
 * The PIXI namespace
 * @external PIXI
 * @see http://pixijs.download/release/docs/index.html
 */

/**
 * Button with a text label
 * @memberof ST.Widgets
 * @extends ST.Widgets.Button
 */
export default class TextButton extends Button {
    /**
     * @param {ST.BaseWidget} parent The widgets parent
     * @param {Object} [options] @see ST.Widgets.BaseWidget
     * @param {String} [options.text] The labels text
     */
    constructor(parent, options = {}) {
        super(parent, options);

        const defaults = {
            text: '',
        };

        options = Object.assign(defaults, options);

        this.label = new Label(this, options.text);
    }

    /**
     * The buttons text
     * @member {String}
     */
    get text() {
        return this.label.text;
    }

    set text(val) { // eslint-disable-line require-jsdoc
        this.label.text = val;
    }
}
