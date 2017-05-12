/**
 * The EventEmitter namespace
 * @external EventEmitter
 * @see https://github.com/primus/eventemitter3
 */

 /**
  * The PIXI namespace
  * @external PIXI
  * @see http://pixijs.download/release/docs/index.html
  */

  /**
   * PIXI.TransformStatic
   * @external TransformStatic
   * @see http://pixijs.download/release/docs/PIXI.TransformStatic.html
   */

   /**
    * PIXI.Container
    * @external Container
    * @see http://pixijs.download/release/docs/PIXI.Container.html
    */

import App from './App';
import {HORIZONTAL, VERTICAL} from './const';
import GraphicsGen from './GraphicsGen';
import Padding from './Padding';
import Point from './Point';
import Size from './Size';
import Theme from './Theme';
import {hackSpriteRendererDrawCounter} from './drawcount';

import * as Widgets from './widgets';

import {Layouts, SizePolicies, Alignment,
    LayoutManager, SizeManager} from './layoutSys';

export {
    HORIZONTAL,
    VERTICAL,
    Alignment,
    Widgets,
    Layouts,
    SizePolicies,
    LayoutManager,
    SizeManager,
    GraphicsGen,
    Padding,
    Point,
    Size,
    Theme,
    App,
    hackSpriteRendererDrawCounter,
};

global.ST = exports; // eslint-disable-line
