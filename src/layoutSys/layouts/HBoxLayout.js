import BoxLayout from './BoxLayout';
import {HORIZONTAL} from '../.././const';

/**
 * Horizontal Box Layout - for convenience
 * @memberof UI.Layouts
 * @extends UI.Layouts.BoxLayout
 */
export default class HBoxLayout extends BoxLayout {
    /**
     * @param {UI.Widgets.BaseWidget} hostWidget
     * - the widget this layout belongs to
     * @param {Number} [spacing=4] - the space in pixels between widgets
     */
    constructor(hostWidget, spacing = 4) {
        super(hostWidget, HORIZONTAL, spacing);
    }
}
