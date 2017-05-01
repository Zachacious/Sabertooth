/*
    uiGraphics.js
 */

import GraphicsGen from './GraphicsGen';
import Theme from './Theme';

/**
 * Creates and holds graphics and textures for a theme.
 * Graphics should be created large enough so they can be scaled
 * down without loss of quality. This way the same graphics can be
 * used throughout without redrawing for every widget resize.
 * @memberof UI
 */
export default class UIGraphics {
    /**
     *
     */
    constructor() {
        /**
         * @member {PIXI.Texture}
         */
        this.panelTexture;

        /**
         * @member {PIXI.Texture}
         */
        this.bodyTexture;

        /**
         * @member {PIXI.Texture}
         */
        this.downTexture;

        /**
         * @member {PIXI.Texture}
         */
        this.hoverTexture;

        /**
         * @member {PIXI.Texture}
         */
        this.disabledTexture;

        /**
         * @member {PIXI.Texture}
         */
        this.altTexture;

        /**
         * @member {PIXI.Graphics}
         */
        this.clipGraphic;

        /**
         * @member {Number}
         */
        this.size = 1;
    }

    /**
     * Create textures and clipgraphic
     * @param {UI.Theme} theme - used to get colors from
     */
    makeGraphicsFromTheme(theme) {
        if(!(theme instanceof Theme)) {
            throw new TypeError('Not a valid Theme!');
        }
        this.panelTexture =
        GraphicsGen.rectangleTexture(this.size,
            this.size, theme.panelColor);

        this.bodyTexture =
        GraphicsGen.rectangleTexture(this.size,
            this.size, theme.bodyColor);

        this.downTexture =
        GraphicsGen.rectangleTexture(this.size,
            this.size, theme.downColor);

        this.hoverTexture = GraphicsGen.rectangleTexture(this.size,
            this.size, theme.hoverColor);

        this.disabledTexture = GraphicsGen.rectangleTexture(this.size,
            this.size, theme.disabledColor);

        this.altTexture = GraphicsGen.rectangleTexture(this.size,
            this.size, theme.altColor);

        this.clipGraphic = GraphicsGen.rectangleGraphic(this.size,
            this.size, 0x000000);
    }
}
