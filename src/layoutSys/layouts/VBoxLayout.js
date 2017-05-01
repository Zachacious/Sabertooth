/*
    VBoxLayout.js
 */

import BoxLayout from './BoxLayout';
import {VERTICAL} from '../.././const';

/**
 * Vertical Box Layout - for convenience
 * @memberof UI.Layouts
 * @extends UI.Layouts.BoxLayout
 */
export default class VBoxLayout extends BoxLayout {
    /**
     * @param {UI.Widgets.BaseWidget} hostWidget
     *  - the widget this layout belongs to
     * @param {Number} [spacing=4] - the space in pixels between widgets
     */
    constructor(hostWidget, spacing = 4) {
        super(hostWidget, VERTICAL, spacing);
        this.nothing = null;
    }
}
