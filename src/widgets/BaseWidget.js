/*
    BaseWidget.js
 */

import * as PIXI from 'pixi.js';
import Theme from '.././Theme';
import Padding from '.././Padding';
import Point from '.././Point';
import Size from '.././Size';
import FixedLayout from '../layoutSys/layouts/FixedLayout';
import FixedPolicy from '../layoutSys/sizePolicies/FixedPolicy';
import {setOptions} from '.././options';
import SITransform from './SITransform';
import {HORIZONTAL, VERTICAL} from '.././const';
// import WidgetShader from '.././WidgetShader';

/**
 * The Basic base widget
 * @memberof UI.Widgets
 * @extends PIXI.Container
 * @abstract
 */
export default class BaseWidget extends PIXI.Container {
    /**
     * @param {UI.Widgets.BaseWidget} parent - the parent widget
     * @param {Object} [options] - optional parameters
     * @param {UI.Theme} options.theme - Theme for this widget -
     * defaults to current theme
     * @param {Number} [options.x=0] - x position
     * @param {Number} [options.y=0] - y position
     * @param {Number} [options.width=0] - widget's width
     * @param {Number} [options.height=0] - widget's height
     * @param {Number} [options.minWidth=0] - min width allowed
     * @param {Number} [options.minHeight=0] - min height allowed
     * @param {Number} [options.maxWidth=10000] - max width allowed
     * @param {Number} [options.maxHeight=10000] - max height allowed
     * @param {Number} [options.padTop=4] -top padding
     * @param {Number} [options.padLeft=4] -left padding
     * @param {Number} [options.padBottom=4] -bottom padding
     * @param {Number} [options.padRight=4] -right padding
     */
    constructor(parent, options) {
        super();

        /**
         * Holds default options - dont use directly
         * @type {Object}
         * @protected
         */
        this._defaults = this._defaults || {};
        let defaults = this._defaults;

        defaults.theme = defaults.theme || null; // || Theme.current;
        defaults.x = defaults.x || 0;
        defaults.y = defaults.y || 0;
        defaults.width = defaults.width || 0;
        defaults.height = defaults.height || 0;
        defaults.minWidth = defaults.minWidth || 0;
        defaults.minHeight = defaults.minHeight || 0;
        defaults.maxWidth = defaults.maxWidth || 10000;
        defaults.maxHeight = defaults.maxHeight || 10000;
        defaults.padTop = defaults.padTop || 4;
        defaults.padLeft = defaults.padLeft || 4;
        defaults.padBottom = defaults.padBottom || 4;
        defaults.padRight = defaults.padRight || 4;
        defaults.hPolicy = defaults.hPolicy
        || new FixedPolicy(this, HORIZONTAL);
        defaults.vPolicy = defaults.vPolicy
        || new FixedPolicy(this, VERTICAL);
        defaults.layout = defaults.layout || new FixedLayout(this);

        options = setOptions(options, defaults);

        if(parent) {
            parent.addChild(this);
        }

        // All widgets should be size independent from their parents.
        // SITransform acomplishes this.
        this.transform = new SITransform();

        /**
         * Allows width and height to control a child object
         * @type {PIXI.Container}
         * @default this
         * @private
         */
        this._sizeProxy = this;

        /**
         * Internal Theme
         * @type {UI.Theme}
         * @private
         */
        if(options.theme) {
            this._theme = options.theme;
        }

        // this.idealThemeFrameNode = 'baseWidget';
        // this.themeFrameRootNode;

        /**
         * Holds padding component
         * @type {UI.Padding}
         */
        this.padding = new Padding();
        this.padding.set(options.padTop, options.padLeft,
            options.padBottom, options.padRight);

        /**
         * The internal HORIZONTAL policy
         * @type {UI.SizePolicies.BasePolicy}
         * @private
         */
        this._hPolicy = options.hPolicy;

        /**
         * The internal VERTICAL policy
         * @type {UI.SizePolicies.BasePolicy}
         * @private
         */
        this._vPolicy = options.vPolicy;

        /**
         * Holds the layout internally
         * @type {UI.Layouts.BaseLayout}
         * @private
         */
        this._layout = options.layout;

        /**
         * Overides PIXI.Container's position allowing us to
         * add offset to position in layout before applying the final position
         * @type {UI.Point}
         * @override
         */
        this._position = new Point();
        this._position.set(options.x, options.y);

        /**
         * Hold minimum allowed size for the widget
         * @type {UI.Size}
         */
        this.min = new Size();
        this.min.set(options.minWidth, options.minHeight);

        /**
         * Holds maximum allowed size for the widget
         * @type {UI.Size}
         */
        this.max = new Size();
        this.max.set(options.maxWidth, options.maxHeight);

        /**
         * Widget width
         * @type {Number}
         */
        this.width = options.width;

        /**
         * Widget height
         * @type {Number}
         */
        this.height = options.height;

        this.valid = false;

        this.bypassInvalidation = false;

        // if no theme is set at this point set default
        if(!this._theme) {
            if(this.parent) {
                this._theme = this.parent.theme;
            } else {
                this._theme = new Theme();
            }
        }

        // this.pointercancel = this.paintDefault;
        // this.pointerdown = this.paintDown;
        // this.pointerover = this.paintHover;
        // this.pointerout = this.paintDefault;
        // this.pointerup = this.paintHover;

        this.on('mousecancel', this.paintDefault);
        this.on('mousedown', this.paintDown);
        this.on('mouseover', this.paintHover);
        this.on('mouseout', this.paintDefault);
        this.on('mouseup', this.paintHover);

        // this.dragging = false;
        //
        // this.on('pointercancel', (e)=>{
        //     this.paintDefault();
        //     this.dragging = false;
        //     e.stopPropagation();
        // });
        // this.on('pointerdown', (e)=>{
        //     this.paintDown();
        //     this.dragging = false;
        //     e.stopPropagation();
        // });
        // this.on('pointerover', (e)=>{
        //     this.paintHover();
        //     // e.stopPropagation();
        // });
        // this.on('pointerupoutside', (e)=>{
        //     this.dragging = false;
        //     this.paintDefault();
        //     e.stopPropagation();
        // });
        // this.on('pointerup', (e)=>{
        //     this.dragging = false;
        //     this.paintHover();
        //     // e.stopPropagation();
        // });
        // this.on('pointerout', (e)=>{
        //     this.dragging = false;
        //     this.paintDefault();
        //     // e.stopPropagation();
        // });
        // this.on('pointermove', (e)=>{
        //     if(this.dragging) e.stopPropagation();
        // });

        /**
         * Stores the state of the interactive property
         * @private
         */
        this._interactiveState = this.interactive;

        /**
         * Internal - disabled state
         */
        this._disabled = false;

        /**
         * PIXI.Graphics used to mask the widgets contents -
         * usually applies to children
         * @type {PIXI.Graphics}
         * @default null
         * @protected
         */
        this._clipGraphic = Theme.clipGraphic.clone();
        this.addChild(this._clipGraphic);
        this._clipGraphic.boundsPadding = 0;
        this._updateClipGraphic();
        this._clipGraphic.renderable = false;

        // this.padding.on('paddingChanged', this.routeInvalidation, this);
        // this.position.on('changed', this.routeInvalidation, this);
        // this.on('sizeChanged', this.routeInvalidation, this);
        // this.on('layoutChanged', this.routeInvalidation, this);
        // this.on('policyChanged', this.routeInvalidation, this);

        this.name = '';
        // this.color = PIXI.utils.hex2rgb(0x000000);
    }

    /**
     * TODO
     */
    paintDefault() {}

    /**
     * TODO
     */
    paintHover() {}

    /**
     * TODO
     */
    paintDown() {}

    /**
     * TODO
     */
    paintDisabled() {}

    /**
     *Used internally to prevent updates when changeing PROPERTIES
     *@private
     */
    beginBypassUpdate() {
        this.bypassInvalidation = true;
    }

    /**
     *Used internally to prevent updates when changeing PROPERTIES
     *@private
     */
    endBypassUpdate() {
        this.bypassInvalidation = false;
    }

    /**
     * Updates size and layout
     */
    update() {
        // this.sizeManager.update();
        // this.layoutManager.update();
        this._hPolicy.exec();
        this._vPolicy.exec();
        this._layout.exec();
        console.log('update: ' + this.name);
    }

    /**
     * TODO
     * @param {Object} context - contextual this
     */
    validate() {
        this.valid = true;
    }

    /**
     * TODO
     * @param {Boolean} [route=false] - wether to route the invalidation
     */
    invalidate(route = false) {
        if(!route) {
            this.valid = false;
        } else {
            this.routeInvalidation();
        }
    }

    /**
     * TODO
     * @param {Object} context todo
     */
    routeInvalidation() {
        let done = false;
        let par = this;
        let child = this;
        while(!done) {
            child = par;
            par = par.parent;
            if(!par) {
                child.invalidate();
                done = true;
            } else if(par.layout instanceof FixedLayout) {
                par.invalidate();
                done = true;
            }
        }
    }

    /**
     * TODO
     */
    recursiveRouteUpdate() {
        let par = this;
        if(par.parent) {
            par = par.parent;
            if(!par.valid) {
                par.recursiveRouteUpdate();
            } else {
                this.update();
            }
        } else {
            this.update();
        }
    }

    /**
     * Called every frame and is used like an update method
     * @override
     * @private
     */
    renderCanvas(ren) {
        super.renderCanvas(ren);
        if(!this.valid) {
            this.recursiveRouteUpdate();
        }
        this.emit('render');
    }

    /**
     * Called every frame and is used like an update method
     * @override
     * @private
     */
    renderWebGL(ren) {
        // WidgetShader.inst().color = this.color;
        super.renderWebGL(ren);
        if(!this.valid) {
            this.recursiveRouteUpdate();
        }
        this.emit('render');
    }

    /**
     * Override from PIXI.Container
     * @param {UI.Widgets.BaseWidget} widget - parent to be
     * @override
     */
    setParent(widget) {
        widget.addChild(this);
    }

    /**
     * Overidden from PIXI.Container - adds child widget
     * @param {UI.Widgets.BaseWidget} child - the child to add
     * @override
     */
    addChild(child) {
        super.addChild(child);
        if(child instanceof PIXI.Container) {
            // set child to be masked by its parent(this widget)
            child.mask = this._clipGraphic;
        }
        if(child instanceof BaseWidget) {
            child.theme = this.theme;
            if(child.sizeProxy) {
                child.sizeProxy.mask = this._clipGraphic;
            }
        }
    }

    /**
     * Overidden from PIXI.Container - adds child widget at specified index
     * @param {UI.Widgets.BaseWidget} child - the child to add
     * @param {Number} index - the index into children array
     * @override
     */
    addChildAt(child, index) {
        super.addChildAt(child, index);
        if(child instanceof PIXI.Container) {
            // set child to be masked by its parent(this widget)
            child.mask = this._clipGraphic;
        }
        if(child instanceof BaseWidget) {
            child.theme = this.theme;
            if(child.sizeProxy) {
                child.sizeProxy.mask = this._clipGraphic;
            }
        }
    }


    /**
     * Overidden from PIXI.Container - Handle changes to children array
     * @override
     */
    onChildrenChange() {
        this.layout.hostChildrenChanged();
        if(!this.bypassInvalidation) this.routeInvalidation();
    }

    /**
     * Apply the otherwise virtual position.
     * @private
     * @param {Number} [offsetX = 0] added to the position
     * @param {Number} [offsetY = 0] added to the position
     */
    applyPosition(offsetX = 0, offsetY = 0) {
        // offsetX += this.width * this.pivot.x;
        // offsetY += this.height * this.pivot.y;
        this.transform.position.set(this.x + offsetX, this.y + offsetY);
    }

    /**
     * Update the clip graphic - this clipGraphic is used to mask
     * its children
     * @param {Object} context - contextual this
     * @private
     */
    _updateClipGraphic() {
        let pad = this.padding;
        let w = this.width - (pad.left + pad.right);
        let h = this.height - (pad.top + pad.bottom);
        let cg = this._clipGraphic;
        cg.width = w;
        cg.height = h;
        cg.transform.position.set(pad.left, pad.top);
        cg.renderable = false;
    }

    // /**
    //  * Update the root node to access the appropriate texture frame
    //  * for the widget if the set theme has one.
    //  */
    // updateThemeTextureRoot() {
    //     let node = this.theme.frames[this.idealThemeFrameNode]
    //         ? this.idealThemeFrame : 'default';
    //
    //     this.themeFrameRootNode = this.theme.frames[node];
    // }

    // PROPERTIES ---


    /**
     * The theme that applies to this widget - default is
     * the global Theme.current
     * @type {UI.Theme}
     */
    get theme() {
        return this._theme;
    }

    set theme(theme) { // eslint-disable-line require-jsdoc
        if(this._theme !== theme) {
            this._theme = theme;
            // this.updateThemeTextureRoot();
            this.paintDefault(); // paint widget with current theme

            // recursive - set childrens theme to match
            let i = this.children.length;
            while(i--) {
                let child = this.children[i];
                if(child instanceof BaseWidget) {
                    this.children[i].theme = theme;
                }
            }

            this.emit('themeChanged', this._theme);
        }
    }

    /**
     * The clipGraphic is used to mask this widgets children
     * @type {PIXI.Graphics}
     */
    get clipGraphic() {
        return this._clipGraphic;
    }

    set clipGraphic(cg) { // eslint-disable-line require-jsdoc
        this._clipGraphic = cg;
    }

    /**
     * Used to apply transforms to a proxy that serves as the widget
     * @member {PIXI.Container}
     */
    get sizeProxy() {
        return this._sizeProxy;
    }

    set sizeProxy(val) { // eslint-disable-line require-jsdoc
        if(!(val instanceof PIXI.Container)) {
            throw new TypeError('Widgets sizeProxy must be a PIXI.Container');
        }
        this._sizeProxy = val;
        this._sizeProxy.mask = this.mask;
    }

    /**
     * Set true to disable the widget
     */
    get disabled() {
        return this._disabled;
    }

    // Todo disable children
    set disabled(val) { // eslint-disable-line require-jsdoc
        if(val != this._disabled) {
            this._disabled = val;
            if(this._disabled) { // if widget has changed to disabled
                this._interactiveState = this.interactive; // store state
                this.interactive = false; // disable interactive
                this.paintDisabled();
            } else { // widget has changed to enabled
                this.interactive = this._interactiveState; // restore state
                this.paintDefault();
            }
        }
    }

    /**
     * The HORIZONTAL size policy
     * @member {UI.SizePolicies.BasePolicy}
     */
    get hPolicy() {
        return this._hPolicy;
    }

    set hPolicy(val) { // eslint-disable-line require-jsdoc
        this._hPolicy = val;
        if(!this.bypassInvalidation) this.routeInvalidation();
        this.emit('policyChanged', val);
    }

    /**
     * The VERTICAL size policy
     * @member {UI.SizePolicies.BasePolicy}
     */
    get vPolicy() {
        return this._vPolicy;
    }

    set vPolicy(val) { // eslint-disable-line require-jsdoc
        this._vPolicy = val;
        if(!this.bypassInvalidation) this.routeInvalidation();
        this.emit('policyChanged', val);
    }

    /**
     * The layout that this manager manages
    * @member {UI.Layouts.BaseLayout}
     */
    get layout() {
        return this._layout;
    }

    set layout(val) { // eslint-disable-line require-jsdoc
        this._layout = val;
        if(!this.bypassInvalidation) this.routeInvalidation();
        this.emit('layoutChanged', val);
    }

    /**
     * X position
     * @member {Number}
     */
    get x() {
        return this.position.x;
    }

    set x(val) { // eslint-disable-line require-jsdoc
        this.position.x = val;
        if(!this.bypassInvalidation) this.routeInvalidation();
        // this.emit('positionChanged', this.position);
    }

    /**
     * Y position
     * @member {Number}
     */
    get y() {
        return this.position.y;
    }

    set y(val) { // eslint-disable-line require-jsdoc
        this.position.y = val;
        if(!this.bypassInvalidation) this.routeInvalidation();
        // this.emit('positionChanged', this.position);
    }

    /**
     * Widget position - use position.set(x,y)
     * @member {UI.Point}
     * @override
     * @readonly
     */
    get position() {
        return this._position;
    }

    /**
     * Widget width
     * @member {Number}
     */
    get width() {
        return this.sizeProxy._width;
    }

    set width(val) { // eslint-disable-line require-jsdoc
        const width = this.sizeProxy.getLocalBounds().width;
        if (width !== 0) {
            this.sizeProxy.scale.x = val / width;
        } else {
            this.sizeProxy.scale.x = 1;
        }
        this.sizeProxy._width = val;

        if(!this.bypassInvalidation) this.routeInvalidation();

        this.emit('widthChanged', val);
        this.emit('sizeChanged', this.width, this.height);
    }

    /**
     * Widget height
     * @member {Number}
     */
    get height() {
        return this.sizeProxy._height;
    }

    set height(val) { // eslint-disable-line require-jsdoc
        const height = this.sizeProxy.getLocalBounds().height;
       if (height !== 0) {
           this.sizeProxy.scale.y = val / height;
       } else {
           this.sizeProxy.scale.y = 1;
       }
       this.sizeProxy._height = val;

       if(!this.bypassInvalidation) this.routeInvalidation();

        this.emit('heightChanged', val);
        this.emit('sizeChanged', this.width, this.height);
    }
}
