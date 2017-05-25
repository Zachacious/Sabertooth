import BoxLayout from './BoxLayout';
import {HORIZONTAL} from '../.././const';

/**
 * Arranges widgets horizontally stacked beside each other.
 * (Same as box layout with orientation = ST.HORIZONTAL)
 * @memberof ST.Layouts
 * @extends ST.Layouts.BoxLayout
 *
 * @example
 * let widget = new ST.Widgets.Button(myApp.root, {
 *  width: 100,
 *  height: 30,
 * });
 *
 * widget.layout = new ST.Layouts.HBoxLayout(widget);
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
