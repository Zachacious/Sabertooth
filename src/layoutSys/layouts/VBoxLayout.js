import BoxLayout from './BoxLayout';
import {VERTICAL} from '../.././const';

/**
 * Vertical Box Layout - for convenience
 * @memberof ST.Layouts
 * @extends ST.Layouts.BoxLayout
 */
export default class VBoxLayout extends BoxLayout {
    /**
     * @param {ST.Widgets.BaseWidget} hostWidget
     *  The widget this layout belongs to
     * @param {Number} [spacing=4] The space in pixels between widgets
     */
    constructor(hostWidget, spacing = 4) {
        super(hostWidget, VERTICAL, spacing);
    }
}
