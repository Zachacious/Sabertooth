/*
    StageWidget.js
 */

import BaseWidget from './BaseWidget';

/**
 * Container widget that keeps a fixed width and height
 * @memberof UI.Widgets
 */
export default class StageWidget extends BaseWidget {
    /**
     * @inheritdoc
     */
    constructor(parent, options) {
        super(parent, options);
    }

    /**
     * @inheritdoc
     * @override
     */
    _calculateBounds() {
        this._bounds.minX = 0;
        this._bounds.minY = 0;
        this._bounds.maxX = this._width;
        this._bounds.maxY = this._height;
    }
}
