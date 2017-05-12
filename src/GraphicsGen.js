import * as PIXI from 'pixi.js';

/**
 * Methods that generate Pixi.Graphics
 * @memberof ST
 */
export default class GraphicsGen {

    /**
     * Generate a rectangle as a graphic
     * @param {Number} width - width of rectangle
     * @param {Number} height - height of rectangle
     * @param {Number} color - color of rectangle
     * @static
     * @return {PIXI.Graphics}
     */
    static rectangleGraphic(width, height, color) {
        let graphic = new PIXI.Graphics();
        graphic.beginFill(color);
        graphic.drawRect(0, 0, width, height);
        graphic.endFill();
        return graphic;
    }

    /**
     * Generate a rectangle as a texture
     * @param {Number} width - width of rectangle
     * @param {Number} height - height of rectangle
     * @param {Number} color - color of rectangle
     * @static
     * @return {PIXI.Texture}
     */
    static rectangleTexture(width, height, color) {
        let graphic = GraphicsGen.rectangleGraphic(width, height, color);
        return graphic.generateCanvasTexture();
    }
}
