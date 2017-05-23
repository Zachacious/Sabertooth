import Button from './Button';
import Label from './Label';

/**
 * Button with a text label
 * @memberof ST.Widgets
 * @extends ST.Widgets.Button
 *
 * @example
 * let widget = new ST.Widgets.TextButton(myApp.root, {
 *  width: 100,
 *  height: 30,
 *  text: 'My Text Button',
 * });
 */
export default class TextButton extends Button {
    /**
     * @param {ST.BaseWidget} parent The widgets parent
     * @param {Object} [options] See {@link ST.Widgets.BaseWidget}
     * @param {String} [options.text] The labels text
     */
    constructor(parent, options = {}) {
        super(parent, options);

        const defaults = {
            text: '',
        };

        options = Object.assign(defaults, options);

        /**
         * The internal label
         * @member {ST.Widgets.Label}
         * @private
         */
        this.label = new Label(this, {text: options.text});
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
