import BaseWidget from './BaseWidget';

/**
 * Image Widget
 * @extends UI.Widgets.BaseWidget
 * @memberof UI.Widgets
 */
export default class Image extends BaseWidget {
    /**
     *@param {UI.Widgets.BaseWidget} parent widgets parent
     *@param {PIXI.Texture} [texture = null] the texture for the Image
     *@param {Object} [options]
     */
    constructor(parent, texture = null, options) {
        super(parent, options);

        this.imgObj = new PIXI.Sprite();
        if(texture) {
            this.imgObj.texture = texture;
        }
        this.addChild(this.imgObj);
        this.imgObj.width = this.width;
        this.imgObj.height = this.height;

        this.sizeProxy = this.imgObj;
    }

    /*
        TODO: handle paintDefault, paintDown etc. to tint the image
     */
}
