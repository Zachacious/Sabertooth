import * as PIXI from 'pixi.js';
// import {autoDetectRenderer} from 'pixi.js/lib/core';
import Theme from './Theme';
import StageWidget from './widgets/StageWidget';
import EventEmitter from 'eventemitter3';

/**
 * App will setup PIXI renderer and root widget automatically.
 * Just call App.update() from your render loop
 * @class
 * @memberof ST
 * @extends external:EventEmitter
 */
export default class App extends EventEmitter {
  /**
   * @param {Object} options - Optional parameters
   * @param {String} [options.name] - The apps name
   * @param {ST.Theme} [options.theme]
   * - Theme used by the app - by default creates
   * a new Theme with default settings.
   * @param {Boolean} [options.transparentBkg=false] - True makes
   * background transparent
   * @param {Boolean} [options.antialiasing=false] - Sets antialiasing
   * @param {Boolean} [options.forceFXAA=false] - Lower quality antialiasing but
   * performs better
   * @param {Number} [options.resolution=1] - Pixi renderer resolution
   * @param {Number} [options.width=800] - Width of app renderer
   * @param {Number} [options.height=600] - Height of app renderer
   * @param {Boolean} [options.autoResize=true] - True makes app resize with
   * browser automatically
   */
  constructor(options = {}) {
      super();
    const defaults = {
      name: 'My App',
      theme: new Theme(),
      transparentBkg: false,
      antialiasing: false,
      forceFXAA: false,
      resolution: 1,
      width: 800,
      height: 600,
      autoResize: true,
    };

    // fill in missing options with defaults
    options = Object.assign(defaults, options);

    /**
     * The internal name of the app
     * @type {String}
     * @private
     */
    this._name = options.name;

    // html docs title tag
    document.title = this._name;

    const renderOptions = {
      resolution: options.resolution,
      forceFXAA: options.forceFXAA,
      antialias: options.antialiasing,
      transparent: options.transparent,
      roundPixels: true,
    };

    /**
     * Points to the correct PIXI renderer. Webgl if possible
     * @member {PIXI.WebglRenderer | PIXI.CanvasRenderer}
     */
    this.renderer = PIXI.autoDetectRenderer(options.width, options.height,
      renderOptions);

    // Add webgl canvas to the doc. Set padding and margins to 0
    document.body.appendChild(this.renderer.view);
    let newStyle = document.createElement('style');
    let style = '* {padding: 0; margin: 0}';
    newStyle.appendChild(document.createTextNode(style));
    document.head.appendChild(newStyle);

    /**
     * Internal theme for app
     * @member {ST.Theme}
     * @private
     */
    this._theme = options.theme;

    /**
     * All widgets should be children or children of children of the
     * root widget.
     *
     * @member {ST.Widgets.BaseWidget}
     */
    this.root = new StageWidget();
    this.root.padding.setAllTo(0);

    this.renderer.backgroundColor = this._theme.background;

    if(options.autoResize) {
      this.resizeToWindow();
    } else {
      this.renderer.resize(options.width, options.height);
      this.root.width = options.width;
      this.root.height = options.height;
    }

    /**
     * Internal autoResize
     * @private
     */
    this._autoResize = false;
    this.autoResize = options.autoResize;

    // this.on('resize', ()=>{
    //   this.root.width = window.innerWidth;
    //   this.root.height = window.innerHeight;
    // }, this);

    // listen for window resize. emit signal
    window.addEventListener('resize', (e)=>{
      this.emit('resize');
    });

    /**
     * Fires when the window is resized
     * @event ST.App#resize
     */
  }

  /**
   * Resizes the renderer and root widget to match the browser size
   */
  resizeToWindow() {
    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.root.width = window.innerWidth;
    this.root.height = window.innerHeight;
  }

  /**
   * Renders the root widget
   */
  update() {
      this.renderer.render(this.root);
  }

  /**
   * The name of the app
   * @member {String}
   */
  get name() {
    return this._name;
  }

  set name(val) { // eslint-disable-line require-jsdoc
    this._name = val;
    document.title = val; // html doc's title tag
  }

  /**
   * The theme for the app
   * @member {ST.Theme}
   */
  get theme() {
    return this._theme;
  }

  set theme(val) { // eslint-disable-line require-jsdoc
    this._theme = val;
    this.renderer.backgroundColor = this._theme.background;
    this.root.theme = this._theme;
  }

  /**
   *If true the app will auto-size itself to fit the browser window
   *@member {Boolean}
   */
  get autoResize() {
    return this._autoResize;
  }

  set autoResize(val) { // eslint-disable-line require-jsdoc
    const listeners = this.listeners('resize');

    if(val) {
      if(listeners.indexOf(this.resizeToWindow) === -1) {
        // listener doesnt exist so add it
        this.on('resize', this.resizeToWindow, this);
      }
    } else {
      if(listeners.indexOf(this.resizeToWindow) !== -1) {
        // listener exist so remove it
        this.removeListener('resize', this.resizeToWindow);
      }
    }
  }
}
