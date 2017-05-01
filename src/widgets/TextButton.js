/*
    TextButton.js
 */

import Button from './Button';
import Label from './Label';

/**
 * TODO
 * @memberof UI.Widgets
 */
export default class TextButton extends Button {
    /**
     * TODO
     * @param {UI.BaseWidget} parent todo
     * @param {String} [text] todo
     * @param {Object} [options] todo
     */
    constructor(parent, text = '', options) {
        super(parent, options);

        this.label = new Label(this, text);
    }

    /**
     * @member {String} todo
     */
    get text() {
        return this.label.text;
    }

    set text(val) { // eslint-disable-line require-jsdoc
        this.label.text = val;
    }
}
