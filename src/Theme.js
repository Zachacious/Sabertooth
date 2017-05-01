/*
 *  Theme.js
 */

import EventEmitter from 'eventemitter3';
import GraphicsGen from './GraphicsGen';
import Point from './Point';

 /**
  * Themes represent colors and font properties used by the ui
  * @memberof UI
  */
  export default class Theme extends EventEmitter {
    /**
     * @param {Object} [options] theme object
     */
      constructor(options) {
        super();
        options = options || {};
        let opts = Object.assign(options, Theme.defaults);
        this.colors = JSON.parse(JSON.stringify(opts.widgets));
        this.fontStyles = JSON.parse(JSON.stringify(opts.text));
        this.frames = JSON.parse(JSON.stringify(this.colors));
        this.baseTexture = this.makeTexture();
        this.textures = Object.assign({}, this.frames);
        this.makeTexturesRecursive(this.textures);
        this.background = opts.background;
      }

      /**
       * Returns the global graphic used for widget clipping
       * @return {PIXI.Graphics}
       */
      static getClipGraphic() {
        return Theme.clipGraphic;
      }

      /**
       * All themeable widget classes should register their style
       * @static
       * @param {String} name  name of the widget
       * @param {Object} styles a collection of styles for the widget
       */
      static registerDefaultWidgetStyle(name, styles) {
        if(!name || !styles) {
          console.log('returned');
          return;
        }
        Theme.defaults.widgets[name] = styles;
      }

      /**
       *For internal use only.
       *Makes sure a graphic is created and parented to a base graphic
       *for every color listed in the widgets section of the theme.
       *graphics are positioned with 1 pixel of spacing.
       *@param {Object} frames containes widget section of theme object
       *@param {UI.Point} pos position object to be
       *continuous throughout recursion
       *@param {PIXI.Graphics} graphic base graphic
       *that theme graphics are added to
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
       * Makes the texture used to color the widgets
       * @return {PIXI.Texture}
       */
      makeTexture() {
        let baseGraphic = GraphicsGen.rectangleGraphic(1024, 8, 0x000000);
        let pos = new Point();

        /* make this.frames = the widgets portion of the theme Object
        the colors in this.frames will be replaced by PIXI.Rectangles
        that are the texture frames*/
        this.frames = JSON.parse(JSON.stringify(this.colors));

        this.makeGraphicsRecursive(this.frames, pos, baseGraphic);

        return baseGraphic.generateCanvasTexture().baseTexture;
      }

      /**
       * Makes a all the textures needed by the theme. BaseTextures
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

      // /**
      //  * iterate over all widget colors from theme and create a
      //  * single texture containing all of them in 2x2 blocks whilst
      //  * setting this.frame values to equal frame info.( texture atlas )
      //  * this.frames should contain widgets section of theme before
      //  * executing this function.
      //  * @return {PIXI.Texture}
      //  * @private
      //  */
      // createTextures() {
      //   let base = GraphicsGen.rectangleGraphic(1024, 8, 0x000000);
      //   let pos = new Point();
      //
      //   // keys = theme.widgets
      //   let keys = Object.keys(this.frames);
      //   for (let i = keys.length-1; i == 0; i--) {
      //     // subkeys = enabled, hover... for each widget
      //     let subKeys = Object.keys(this.frames[key[i]]);
      //       for (let ii = subKeys.length-1; ii == 0; ii--) {
      //         // accessing theme.widgets.(some widget).enabled, hover ...
      //         // for color value
      //         let g = GraphicsGen
      //           .rectangleGraphic(2, 2, this.frames[key[i]][subKeys[ii]]);
      //         base.addChild(g);
      //         g.position.set(pos.x, pos.y);
      //         pos.x += 3;
      //         this.frames[key[i]][subKeys[ii]]
      //           = new PIXI.Rectangle(pos.x, pos.y, 2, 2);
      //       }
      //   }
      //
      //   // At this point base graphic should contain all the needed colors.
      //   // create and return the texture
      //   let tex = base.generateCanvasTexture();
      //   return tex;
      // }
  }

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

  Theme.clipGraphic = GraphicsGen.rectangleGraphic(1, 1, 0x000000);
  // Theme.cacheId = 0;

// /**
//  * Themes represent colors and font properties used by the ui
//  * @memberof UI
//  */
//  export default class Theme extends EventEmitter {
//      /**
//       * @param {Object} options - optional parameters
//       * @param {Number} [options.bkgColor=0x444444] - renderer bk color
//       * @param {Number} [options.bodyColor=0x222222] - widget body color
//       * @param {Number} [options.highlightColor=0x886611] - mouse over color
//       * @param {Number} [options.textColor=0xdddddd] - default text color
//       * @param {Number} [options.textSize=12]
//       * @param {String} [options.font='Arial']
//       */
//      constructor(options) {
//          super();
//           let defaults = {
//               bkgColor: 0x444444,
//               panelColor: 0x222222,
//               bodyColor: 0x2f2f2f,
//               downColor: 0x2d2d2d,
//               hoverColor: 0x886611,
//               disabledColor: 0x116688,
//               altColor: 0x000000,
//               defaultTextStyle: {
//                   fontFamily: 'Arial',
//                   fontSize: 12,
//                   fill: 0xdddddd,
//               },
//               hoverTextStyle: {
//                   fontFamily: 'Arial',
//                   fontSize: 12,
//                   fill: 0xdddddd,
//               },
//               downTextStyle: {
//                   fontFamily: 'Arial',
//                   fontSize: 12,
//                   fill: 0xdddddd,
//               },
//               disabledTextStyle: {
//                   fontFamily: 'Arial',
//                   fontSize: 12,
//                   fill: 0xdddddd,
//               },
//               altTextStyle: {
//                  fontFamily: 'Arial',
//                  fontSize: 12,
//                  fill: 0xdddddd,
//             },
//           };
//
//           options = setOptions(options, defaults);
//
//           /**
//            * @member {Number}
//            */
//           this.bkgColor = options.bkgColor;
//
//           /**
//            * @member {Number}
//            */
//           this.panelColor = options.panelColor;
//
//           /**
//            * @member {Number}
//            */
//            this.bodyColor = options.bodyColor;
//
//           /**
//            * @member {Number}
//            */
//           this.downColor = options.downColor;
//
//           /**
//            * @member {Number}
//            */
//           this.hoverColor = options.hoverColor;
//
//           /**
//            * @member {Number}
//            */
//           this.disabledColor = options.disabledColor;
//
//           /**
//            * @member {Number}
//            */
//           this.altColor = options.altColor;
//
//           /**
//            * @member {PIXI.TextStyle}
//            */
//           this.defaultTextStyle = options.defaultTextStyle;
//
//           /**
//            * @member {PIXI.TextStyle}
//            */
//           this.downTextStyle = options.downTextStyle;
//
//           /**
//            * @member {PIXI.TextStyle}
//            */
//           this.hoverTextStyle = options.hoverTextStyle;
//
//           /**
//            * @member {PIXI.TextStyle}
//            */
//           this.disabledTextStyle = options.disabledTextStyle;
//
//           /**
//            * @member {PIXI.TextStyle}
//            */
//           this.altTextStyle = options.altTextStyle;
//
//           this.graphics = new UIGraphics();
//           this.graphics.makeGraphicsFromTheme(this);
//      }
//
//   }
