import App from './App';
// import Renderer from './Renderer';
import {HORIZONTAL, VERTICAL} from './const';
import GraphicsGen from './GraphicsGen';
import {setOptions} from './options';
import Padding from './Padding';
import Point from './Point';
import Size from './Size';
import Theme from './Theme';
import UIGraphics from './UIGraphics';
// import WidgetShader from './WidgetShader';
import {hackSpriteRendererDrawCounter} from './drawcount';

import * as Widgets from './widgets';

import {Layouts, SizePolicies, Alignment,
    LayoutManager, SizeManager} from './layoutSys';

export {
    HORIZONTAL,
    VERTICAL,
    setOptions,
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
    UIGraphics,
    Theme,
    App,
    // Renderer,
    // WidgetShader,
    hackSpriteRendererDrawCounter,
};

global.UI = exports; // eslint-disable-line
