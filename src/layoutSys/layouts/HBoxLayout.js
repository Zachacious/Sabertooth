import BoxLayout from './BoxLayout';
import {HORIZONTAL} from '../.././const';

/**
 * Horizontal Box Layout - for convenience
 * @memberof ST.Layouts
 * @extends ST.Layouts.BoxLayout
 */
export default class HBoxLayout extends BoxLayout {
    /**
     * @param {ST.Widgets.BaseWidget} hostWidget
     * The widget this layout belongs to
     * @param {Number} [spacing=4] The space in pixels between widgets
     */
    constructor(hostWidget, spacing = 4) {
        super(hostWidget, HORIZONTAL, spacing);
    }
}
