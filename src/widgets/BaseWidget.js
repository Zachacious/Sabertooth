import * as PIXI from 'pixi.js';
import Theme from '.././Theme';
import Padding from '.././Padding';
import Point from '.././Point';
import Size from '.././Size';
import FixedLayout from '../layoutSys/layouts/FixedLayout';
import FixedPolicy from '../layoutSys/sizePolicies/FixedPolicy';
import SITransform from './SITransform';
import {HORIZONTAL, VERTICAL} from '.././const';

/**
 * Sabertooth widgets are extensions of the PIXI.Container class. You can set
 * tint, alpha, blend modes, and filters on them just like pixi containers.
 * @memberof ST.Widgets
 * @extends external:Container
 * @abstract
 */
export default class BaseWidget extends PIXI.Container {
    /**
     * @param {ST.Widgets.BaseWidget} parent - the parent widget
     * @param {Object} [options = Object] - optional parameters
     * @param {ST.Theme} options.theme - Theme for this widget -
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
    constructor(parent, options = {}) {
        super();
        // default options
        const defaults = {
            theme: null,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            minWidth: 0,
            minHeight: 0,
            maxWidth: 10000,
            maxHeight: 10000,
            padTop: 4,
            padLeft: 4,
            padBottom: 4,
            padRight: 4,
            hPolicy: new FixedPolicy(this, HORIZONTAL),
            vPolicy: new FixedPolicy(this, VERTICAL),
            layout: new FixedLayout(this),
        };

        // fill in missing options with defaults
        options = Object.assign(defaults, options);

        // Make sure widgets can be sized independent from
        // their parents.
        // Also fixes widget jitters when resizing
        this.transform = new SITransform();

        /**
         * Allows width and height to control a child object
         * @member {PIXI.Container}
         * @default this
         * @private
         */
        this._sizeProxy = this;

        /**
         * Internal Theme
         * @member {ST.Theme}
         * @private
         */
        if(options.theme) {
            this._theme = options.theme;
        }

        /**
         * Holds padding component
         * @member {ST.Padding}
         */
        this.padding = new Padding();
        this.padding.set(options.padTop, options.padLeft,
            options.padBottom, options.padRight);

        /**
         * The internal HORIZONTAL policy
         * @member {ST.SizePolicies.BasePolicy}
         * @private
         */
        this._hPolicy = options.hPolicy;

        /**
         * The internal VERTICAL policy
         * @member {ST.SizePolicies.BasePolicy}
         * @private
         */
        this._vPolicy = options.vPolicy;

        /**
         * Holds the layout internally
         * @member {ST.Layouts.BaseLayout}
         * @private
         */
        this._layout = options.layout;

        /**
         * Replaces PIXI.Containers position object.
         * This allows us to use a 'virtual' position that we
         * add the padding and alignment to before applying it
         * to the 'real' position.
         * @member {ST.Point}
         * @override
         * @private
         */
        this._position = new Point();
        this._position.set(options.x, options.y);

        /**
         * Hold minimum allowed size for the widget
         * @member {ST.Size}
         */
        this.min = new Size();
        this.min.set(options.minWidth, options.minHeight);

        /**
         * Holds maximum allowed size for the widget
         * @member {ST.Size}
         */
        this.max = new Size();
        this.max.set(options.maxWidth, options.maxHeight);

        /**
         * Widget width
         * @member {Number}
         */
        this.width = options.width;

        /**
         * Widget height
         * @member {Number}
         */
        this.height = options.height;

        /**
         * The state of the widget. If false, the widget will be
         * updated on the next loop iteration. Should only be
         * used in conditional checks
         * @member {Boolean}
         * @readonly
         */
        this.valid = false;

        /**
         * Used internally by beginBypassUpdate() and endBypassUpdate().
         * Should not be used directly
         * @member {Boolean}
         * @private
         */
        this.bypassInvalidation = false;

        /**
         * Stores the state of the interactive property
         * @private
         */
        this._interactiveState = this.interactive;

        /**
         * Internal - disabled state
         * @private
         */
        this._disabled = false;

        /**
         * PIXI.Graphics used to mask the widgets contents -
         * usually applies to children
         * @member {PIXI.Graphics}
         * @private
         */
        this._clipGraphic = Theme.clipGraphic.clone();
        this.addChild(this._clipGraphic);
        this._clipGraphic.boundsPadding = 0;
        this._updateClipGraphic();
        this._clipGraphic.renderable = false;

        // if no theme is set at this point set default
        if(!this._theme) {
            if(this.parent) {
                this._theme = this.parent.theme;
            } else {
                this._theme = new Theme();
            }
        }

        // Connect mouse events with methods that change
        // the widgets texture
        this.on('pointercancel', this.paintDefault);
        this.on('pointerdown', this.paintDown);
        this.on('pointerover', this.paintHover);
        this.on('pointerout', this.paintDefault);
        this.on('pointerup', this.paintHover);

        // Set focus when clicked
        this.on('pointerdown', ()=>{
            this.focus();
        });

        // add this widget to the given parent widget, if any.
        if(parent) {
            parent.addChild(this);
        }

        /**
         * Fires each frame after widget is rendered. Can be used to make
         * per frame updates.
         * @event ST.Widgets.BaseWidget#render
         */

        /**
         * Fires whenever the widgets theme is changed.
         * @event ST.Widgets.BaseWidget#themeChanged
         * @param {ST.Theme} theme The set theme
         */

        /**
         * Fires whenever one of the size policies are changed.
         * @event ST.Widgets.BaseWidget#policyChanged
         * @param {ST.SizePolicies.BasePolicy} policy the set policy
         */

         /**
          * Fires whenever the widgets layout is changed.
          * @event ST.Widgets.BaseWidget#layoutChanged
          * @param {ST.Layouts.BaseLayout} layout The set layout
          */

          /**
          * Fires whenever the widgets width is changed.
          * @event ST.Widgets.BaseWidget#widthChanged
          * @param {Number} width The set width
          */

          /**
          * Fires whenever the widgets height is changed.
          * @event ST.Widgets.BaseWidget#heightChanged
          * @param {Number} height The set height
          */

          /**
          * Fires whenever the widgets size is changed.
          * @event ST.Widgets.BaseWidget#sizeChanged
          * @param {Number} width The set width
          * @param {Number} height The set height
          */

          /**
           * Fires when widget is updated
           * @event ST.Widgets.BaseWidget#updated
           */

          /**
           * Fires when the widget loses focus
           * @event ST.Widgets.BaseWidget#lostFocus
           */

            /**
            * Fires when the widget gains focus
            * @event ST.Widgets.BaseWidget#gainedFocus
            */
    }

    /**
     * Set default textures and other cosmetics
     * @virtual
     */
    paintDefault() {}

    /**
     * Set textures for pointerover events
     * @virtual
     */
    paintHover() {}

    /**
     * Set textures for pointerdown events
     * @virtual
     */
    paintDown() {}

    /**
     * Set textures for disabled state
     * @virtual
     */
    paintDisabled() {}

    /**
     * Retreive the widget currently in focus
     * @static
     * @return {ST.Widgets.BaseWidget}
     */
    static getFocusedWidget() {
        return BaseWidget.currentFocus;
    }

    /**
     * Brings the given widget into focus
     * @param {ST.Widgets.BaseWidget} widget The widget to focus
     * @static
     */
    static focusWidget(widget) {
        if(widget === BaseWidget.currentFocus) {
            return;
        }

        if(BaseWidget.currentFocus) {
            BaseWidget.currentFocus.emit('lostFocus');
        }

        BaseWidget.currentFocus = widget;
        widget.emit('gainedFocus');
    }

    /**
     * Force this widget to take focus
     */
    focus() {
        BaseWidget.focusWidget(this);
    }

    /**
     * Returns true if this widget is the one currently in focus
     * @return {Boolean}
     */
    hasFocus() {
        return this === BaseWidget.currentFocus;
    }

    /**
     * To be overridden by widget subclasses that need code that only run
     * when that widget is in focus. (Method called once per loop if in focus)
     * @virtual
     */
    onHasFocus() {}

    /**
     * Makes sure the widgets width stays between min and max
     * @return {Number} the width
     */
    validateWidth() {
        this.width
            = Math.min(Math.max(this.width, this.min.width), this.max.width);
        return this.width;
    }

    /**
     * Makes sure the widgets height stays between min and max
     * @return {Number} the height
     */
    validateHeight() {
        this.height
            = Math.min(Math.max(this.height, this.min.height), this.max.height);
        return this.height;
    }

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
     * Resizes children based on their size policies and arranges them
     * according to the layout
     */
    update() {
        this._hPolicy.exec();
        this._vPolicy.exec();
        this._layout.exec();
        this.emit('updated');
    }

    /**
     * Sets validation state to true.
     */
    validate() {
        this.valid = true;
    }

    /**
     * Sets invalidation state to false.
     * If widget is invalid, an update will be attempted on the
     * next loop iteration
     * @param {Boolean} [route=false] If true then an attempt will be
     * made to route the invalidation to an ancestor widget.
     * @see #routeInvalidation
     */
    invalidate(route = false) {
        if(!route) {
            this.valid = false;
        } else {
            this.routeInvalidation();
        }
    }

    /**
     * Attempts to route the invalidation of the widget upward through
     * its ancestors untill one with either no parent or
     * one with a FixedLayout is found. This insures that all the affected
     * widgets get updated.
     * @private
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
     * Attempts to send update() upward to the highest invalid parent in an
     * effort to prevent updating any one widget twice in the same
     * loop iteration.
     * @private
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
     * Checks validation and updates if neccessary each frame.
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
     * Checks validation and updates if neccessary each frame.
     * @override
     * @private
     */
    renderWebGL(ren) {
        super.renderWebGL(ren);
        if(!this.valid) {
            this.recursiveRouteUpdate();
        }
        this.emit('render');
    }

    /**
     * Sets the parent of the widget
     * @param {ST.Widgets.BaseWidget} widget Parent to be
     * @override
     */
    setParent(widget) {
        widget.addChild(this);
    }

    /**
     * Adds a child or children widgets. Sets the child to be clipped by
     * its parent and to take its theme.
     * @see http://pixijs.download/release/docs/PIXI.Container.html#addChild
     * @param {ST.Widgets.BaseWidget} child The child or children to add
     * @override
     */
    addChild(child) {
        super.addChild(child);

        // attempt to optimize masking
        if(child instanceof BaseWidget) {
            child.theme = this.theme; // take parents theme
            if(this.layout.updateOnHostChanges) {
                child.mask = this._clipGraphic;
                child.sizeProxy.mask = this._clipGraphic;
            } else if(child.hPolicy.updateOnHostChanges
                    || child.vPolicy.updateOnHostChanges) {
                child.mask = this._clipGraphic;
                child.sizeProxy.mask = this._clipGraphic;
            } else {
                child.mask = null;
                child.sizeProxy.mask = null;
            }
        } else {
            child.mask = null;
        }
    }

    /**
     * Adds a child or children widgets at the specified index.
     * Sets the child to be clipped by its parent and to take its theme.
     * @see http://pixijs.download/release/docs/PIXI.Container.html#addChild
     * @param {ST.Widgets.BaseWidget} child The child to add
     * @param {Number} index The index into children array
     * @override
     */
    addChildAt(child, index) {
        super.addChildAt(child, index);

        // attempt to optimize masking
        if(child instanceof BaseWidget) {
            child.theme = this.theme; // take parents theme
            if(this.layout.updateOnHostChanges) {
                child.mask = this._clipGraphic;
                child.sizeProxy.mask = this._clipGraphic;
            } else if(child.hPolicy.updateOnHostChanges
                    || child.vPolicy.updateOnHostChanges) {
                child.mask = this._clipGraphic;
                child.sizeProxy.mask = this._clipGraphic;
            } else {
                child.mask = null;
                child.sizeProxy.mask = null;
            }
        } else {
            child.mask = null;
        }
        // if(child instanceof PIXI.Container) {
        //     // set child to be masked by its parent(this widget)
        //     child.mask = this._clipGraphic;
        // }
        // if(child instanceof BaseWidget) {
        //     child.theme = this.theme;
        //     if(child.sizeProxy) {
        //         child.sizeProxy.mask = this._clipGraphic;
        //     }
        // }
    }


    /**
     * Invalidates the widget if children have been added or removed.
     * @override
     * @private
     */
    onChildrenChange() {
        this.layout.hostChildrenChanged();
        if(!this.bypassInvalidation) this.routeInvalidation();
    }

    /**
     * Apply the otherwise virtual position.
     * @param {Number} [offsetX = 0] added to the position
     * @param {Number} [offsetY = 0] added to the position
     */
    applyPosition(offsetX = 0, offsetY = 0) {
        this.transform.position.set(this.x + offsetX, this.y + offsetY);
    }

    /**
     * Update the clipgraphics size to match the widgets size - padding.
     * @private
     */
    _updateClipGraphic() {
        const pad = this.padding;
        const w = this.width - (pad.left + pad.right);
        const h = this.height - (pad.top + pad.bottom);
        const cg = this._clipGraphic;
        cg.width = w;
        cg.height = h;
        cg.transform.position.set(pad.left, pad.top);
        cg.renderable = false;// this seems to reset to true when size changes
    }

    /**
     * Mask can degrade performance. This method attempts to remove mask
     * where the size and position of children are tightly controlled via
     * certain layouts and size policies and mask are not needed.
     * Check the layout. If updateOnHostChanges = true then children should
     * be masked. else check children size policies if updateOnHostChanges =
     * true for either, set mask. Else, mask = null;
     * @private
     */
    _evaluateMask() {
        let i;
        if(this.layout.updateOnHostChanges) {
            i = this.children.length;
            while(i--) {
                this.children[i].mask = this.clipGraphic;
                if(this.children[i].sizeProxy) {
                    this.children[i].sizeProxy.mask = this.clipGraphic;
                }
            }
        } else {
            i = this.children.length;
            while(i--) {
                let child = this.children[i];
                if(child instanceof BaseWidget) {
                    if(child.hPolicy.updateOnHostChanges
                        || child.vPolicy.updateOnHostChanges) {
                            this.children[i].mask = this.clipGraphic;
                            this.children[i].sizeProxy.mask
                                = this.clipGraphic;
                    } else {
                        child.mask = null;
                        this.children[i].sizeProxy.mask = null;
                    }
                } else {
                    child.mask = null;
                }
            }
        }
    }

    /**
     * The theme for this widget
     * @member {ST.Theme}
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
                const child = this.children[i];
                if(child instanceof BaseWidget) {
                    this.children[i].theme = theme;
                }
            }

            this.emit('themeChanged', this._theme);
        }
    }

    /**
     * The clipGraphic is used to mask this widgets children
     * @member {PIXI.Graphics}
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
     * @member {Boolean}
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
                this.cacheAsBitmap = true;
            } else { // widget has changed to enabled
                this.interactive = this._interactiveState; // restore state
                this.paintDefault();
                this.cacheAsBitmap = false;
            }
        }

        // recursively set children
        let i = this.children.length;
        while(i--) {
            this.children[i].disabled = val;
        }
    }

    /**
     * The HORIZONTAL size policy
     * @member {ST.SizePolicies.BasePolicy}
     */
    get hPolicy() {
        return this._hPolicy;
    }

    set hPolicy(val) { // eslint-disable-line require-jsdoc
        if(val === this._hPolicy) {
            return;
        }
        this._hPolicy = val;

        // optimize mask if posible
        if(this.parent) {
            this.parent._evaluateMask();
        }

        if(!this.bypassInvalidation) this.routeInvalidation();
        this.emit('policyChanged', val);
    }

    /**
     * The VERTICAL size policy
     * @member {ST.SizePolicies.BasePolicy}
     */
    get vPolicy() {
        return this._vPolicy;
    }

    set vPolicy(val) { // eslint-disable-line require-jsdoc
        if(val === this._vPolicy) {
            return;
        }
        this._vPolicy = val;

        // optimize mask if posible
        if(this.parent) {
            this.parent._evaluateMask();
        }

        if(!this.bypassInvalidation) this.routeInvalidation();
        this.emit('policyChanged', val);
    }

    /**
     * The layout for this widget
     * @member {ST.Layouts.BaseLayout}
     */
    get layout() {
        return this._layout;
    }

    set layout(val) { // eslint-disable-line require-jsdoc
        if(val === this._layout) {
            return;
        }
        this._layout = val;

        // optimize mask if posible
        this._evaluateMask();

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
    }

    /**
     * The position object for the widget(position.set(x, y)).
     * @member {ST.Point}
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

// global- holds the currently focus widget
BaseWidget.currentFocus = null;
