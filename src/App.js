/*
  App.js
 */
 import * as PIXI from 'pixi.js';
 import {setOptions} from './options';
 import Theme from './Theme';
 import StageWidget from './widgets/StageWidget';
 // import WidgetShader from './WidgetShader';
 import EventEmitter from 'eventemitter3';
 // import Renderer from './Renderer';

/**
 * App will setup PIXI renderer and root widget automatically.
 * Just call App.update() from your render loop
 *
 * @class
 * @memberof UI
 */
export default class App extends EventEmitter {
  /**
   *
   * @param {String} name - the name of the app
   * @param {Object} options - Optional parameters
   * @param {UI.Theme} options.theme
   * - Theme used by the app - by default creates
   * a new Theme with default settings.
   * @param {Boolean} [options.transparentBkg=false] - True makes
   * background transparent
   * @param {Boolean} [options.antialiasing=false] - Sets antialiasing
   * @param {Boolean} [options.forceFXAA=false] - Less quality antialiasing but
   * performs better
   * @param {Number} [options.resolution=1] - Pixi renderer resolution
   * @param {Number} [options.width=800] - Width of app renderer
   * @param {Number} [options.height=600] - Height of app renderer
   * @param {Boolean} [options.autoResize=true] - True makes app resize with
   * browser automatically
   */
  constructor(name = 'My App', options) {
      super();
    /**
     * Internal default options
     *
     * @member {Object}
     * @protected
     */
    this._defaults = this._defaults || {};
    let defaults = this._defaults;

    defaults.theme = defaults.theme || new Theme();
    defaults.transparentBkg = defaults.transparentBkg || false;
    defaults.antialiasing = defaults.antialiasing || false;
    defaults.forceFXAA = defaults.forceFXAA || false;
    defaults.resolution = defaults.resolution || 1;
    defaults.width = defaults.width || 800;
    defaults.height = defaults.height || 600;
    defaults.autoResize = defaults.autoResize || true;

    options = setOptions(options, defaults);

    /**
     * The internal name of the app
     * @type {String}
     * @private
     */
    this._name = name;
    document.title = this._name;

    let renderOptions = {
      resolution: options.resolution,
      forceFXAA: options.forceFXAA,
      antialias: options.antialiasing,
      transparent: options.transparent,
      roundPixels: true,
    };

    // PIXI.ticker.shared.autoStart = false;
    // PIXI.ticker.shared.stop();
    // PIXI.INTERACTION_FREQUENCY = 60;

    /**
     * Points to the correct PIXI renderer. Webgl if possible
     * @type {PIXI.WebglRenderer | PIXI.CanvasRenderer}
     */
    this.renderer = PIXI.autoDetectRenderer(options.width, options.height,
      renderOptions);

    // this.renderer.plugins.interaction.moveWhenInside = true;

    // Renderer.setInst(PIXI.autoDetectRenderer(options.width, options.height,
    //   renderOptions));
    // this.renderer.plugins.interaction.interactionFrequency = 100000;

    // Renderer.inst().plugins.sprite.shader = WidgetShader.inst();

    // Setup the document properly
    document.body.appendChild(this.renderer.view);
    let newStyle = document.createElement('style');
    let style = '* {padding: 0; margin: 0}';
    newStyle.appendChild(document.createTextNode(style));
    document.head.appendChild(newStyle);

    /**
     * Internal theme for app
     * @type {UI.Theme}
     * @private
     */
    this._theme = options.theme;
    // this._theme.setCurrent();

    // WidgetShader.setInstance(new WidgetShader(renderer.gl));

    /**
     * Basic empty widget - serves as the topmost widget and size is set
     * to the widow size
     *
     * @type {UI.Widgets.BaseWidget}
     */
    this.root = new StageWidget();
    this.root.padding.setAllTo(0);
    this.root.width = window.innerWidth;
    this.root.height = window.innerHeight;

    this.renderer.backgroundColor = this._theme.background;

    // CONNECTIONS ---

    if(options.autoResize) {
      // initial resize
      this.renderer.resize(window.innerWidth, window.innerHeight);

      this.on('resize', ()=>{
          this.renderer.resize(window.innerWidth, window.innerHeight);
      }, this);
    }

    this.on('resize', ()=>{
      this.root.width = window.innerWidth;
      this.root.height = window.innerHeight;
    }, this);

    // listen for window resize. emit signal
    window.addEventListener('resize', (e)=>{
      // this.signal_documentResize.emit();
      this.emit('resize');
    });
  }

  /**
   * Renders the root widget
   */
  update() {
    if(this.root) {
      this.renderer.render(this.root);
    }
  }

  // properties

  /**
   * The name of the app
   * @return {String}
   */
  get name() {
    return this._name;
  }

  set name(val) { // eslint-disable-line require-jsdoc
    this._name = val;
    document.title = val;
  }

  /**
   * The theme for the app
   * @return {UI.Theme}
   */
  get theme() {
    return this._theme;
  }

  set theme(val) { // eslint-disable-line require-jsdoc
    this._theme = val;
    this.renderer.backgroundColor = this._theme.background;
    this.root.theme = this._theme;
  }
}
