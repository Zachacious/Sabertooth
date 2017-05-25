import BaseWidget from './BaseWidget';

/**
 * Wraps PIXI.Sprite and allows images/ textures to become widgets
 * @extends ST.Widgets.BaseWidget
 * @memberof ST.Widgets
 *
 * @example
 * // load texture with PIXI first, then...
 *
 * let widget = new ST.Widgets.Image(myApp.root, {texture: myTexture});
 */
export default class Image extends BaseWidget {
    /**
     *@param {ST.Widgets.BaseWidget} parent Widgets parent
     *@param {Object} [options = Object] See {@link ST.Widgets.BaseWidget}
     *@param {PIXI.Texture} [options.texture = null] The texture for the Image
     */
    constructor(parent, options = {}) {
        super(parent, options);
        // default options
        const defaults = {
                texture: null,
        };

        // fill in missing options with defaults
        options = Object.assign(defaults, options);

        // Images could be interactive but most will not
        this.interactive = false;

        /**
         * Holds the sprite internally
         * @member {PIXI.Sprite}
         * @private
         */
        this._sprite = new PIXI.Sprite();
        if(options.texture) {
            this._sprite.texture = options.texture;
        }
        this.addChild(this._sprite);
        this._sprite.width = this.width;
        this._sprite.height = this.height;

        this.sizeProxy = this._sprite;
    }

     /**
      * The PIXI.Sprite used internally
      * @member {PIXI.Sprite}
      */
    get sprite() {
        return this._sprite;
    }

    set sprite(val) { // eslint-disable-line require-jsdoc
        if(val instanceof PIXI.Sprite) {
            this._sprite = val;
        }
    }

    /**
     *The sprites texture
     *@member {PIXI.Texture}
     */
    get texture() {
        return this._sprite.texture;
    }

    set texture(val) { // eslint-disable-line require-jsdoc
        if(val instanceof PIXI.Texture) {
            this._sprite.texture = val;
        }
    }
}
