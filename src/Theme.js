import EventEmitter from 'eventemitter3';
import GraphicsGen from './GraphicsGen';
import Point from './Point';

/**
 * The EventEmitter namespace
 * @external EventEmitter
 * @see https://github.com/primus/eventemitter3
 */

 /**
  * Themes represent colors and font properties used by the ui
  * @memberof ST
  * @extends external:EventEmitter
  */
  export default class Theme extends EventEmitter {
    /**
     * @param {Object} [options] theme object
     */
      constructor(options = {}) {
        super();
        const opts = Object.assign(options, Theme.defaults);

        /**
         * Theme colors
         * @member {Object}
         */
        this.colors = JSON.parse(JSON.stringify(opts.widgets));

        /**
         * Theme font styles
         * @member {Object}
         */
        this.fontStyles = JSON.parse(JSON.stringify(opts.text));

        /**
         * Frame rects for theme textures
         * @member {Object}
         */
        this.frames = JSON.parse(JSON.stringify(this.colors));

        /**
         * The base texture for all the themes textures
         * @member {PIXI.baseTexture}
         */
        this.baseTexture = this.makeTexture();

        /**
         * Theme textures(frames for the base texture)
         * @member {Object}
         */
        this.textures = Object.assign({}, this.frames);

        // Creates the textures from the frames
        this.makeTexturesRecursive(this.textures);

        // App background color
        this.background = opts.background;
      }

      /**
       * Returns the global graphic used for widget clipping
       * @static
       * @return {PIXI.Graphics}
       */
      static getClipGraphic() {
        return Theme.clipGraphic;
      }

      /**
       * Adds the given styles to the global Theme.defaults.
       * @param {String} name  Name of the widget
       * @param {Object} styles A collection of styles for the widget
       * @static
       */
      static registerDefaultWidgetStyle(name, styles) {
        if(!name || !styles) {
          console.log('returned');
          return;
        }
        Theme.defaults.widgets[name] = styles;
      }

      /**
       *(For internal use only!)
       *Makes sure a graphic is created and parented to a base graphic
       *for every color listed in the widgets section of the theme.
       *graphics are positioned with 1 pixel of spacing.
       *@param {Object} frames containes widget section of theme object
       *@param {ST.Point} pos position object to be
       *continuous throughout recursion
       *@param {PIXI.Graphics} graphic base graphic
       *that theme graphics are added to
       *@private
       */
     makeGraphicsRecursive(frames, pos, graphic) {
        let keys = Object.keys(frames);

        for (let i = 0; i < keys.length; i++) {
          if(frames[keys[i]] instanceof PIXI.Rectangle) continue;
            if(typeof frames[keys[i]] === 'number') {
              let g = GraphicsGen
                .rectangleGraphic(4, 4, frames[keys[i]]);
                graphic.addChild(g);
                g.position.set(pos.x, pos.y);
                frames[keys[i]] = new PIXI.Rectangle(pos.x+1, pos.y+1, 1, 1);
                pos.x += 6;
            } else {
                this.makeGraphicsRecursive(frames[keys[i]], pos, graphic);
            }
        }
      }

      /**
       * Makes the base texture used to color the widgets
       * @private
       * @return {PIXI.Texture}
       */
      makeTexture() {
        let baseGraphic = GraphicsGen.rectangleGraphic(1024, 8, 0x000000);
        let pos = new Point();

        /* make this.frames = the widgets portion of the theme Object.
        The colors in this.frames will be replaced by PIXI.Rectangles
        that are the texture frames*/
        this.frames = JSON.parse(JSON.stringify(this.colors));

        this.makeGraphicsRecursive(this.frames, pos, baseGraphic);

        return baseGraphic.generateCanvasTexture().baseTexture;
      }

      /**
       * Makes all the textures needed by the theme. BaseTextures
       * contain the actual image. Textures serve as frames for the
       * sprites.
       * @param {PIXI.BaseTexture} tex
       * @private
       */
      makeTexturesRecursive(tex = this.textures) {
        let keys = Object.keys(tex);

        for(let i = 0; i < keys.length; i++) {
          if(tex[keys[i]] instanceof PIXI.Texture) continue;
            if(tex[keys[i]] instanceof PIXI.Rectangle) {
              tex[keys[i]] =
                new PIXI.Texture(this.baseTexture, tex[keys[i]]);
            } else {
              this.makeTexturesRecursive(tex[keys[i]]);
            }
        }
      }
  }

// Global Theme defaults
  Theme.defaults = {
      background: 0x222222,
      widgets: {

      },
      text:
      {
        enabled: {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0x959595,
        },
        disabled: {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0x555555,
        },
        hover: {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0x85ad85,
        },
        click: {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0x99c799,
        },
      },
  };

// Global clip graphic
  Theme.clipGraphic = GraphicsGen.rectangleGraphic(1, 1, 0x000000);
