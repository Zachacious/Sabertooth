import Theme from '.././Theme';
import Container from './Container';
// import Button from './Button';
import Image from './Image';
import Alignment from '../layoutSys/Alignment';
import ExpandingPolicy
    from '../layoutSys/sizePolicies/ExpandingPolicy';
import FixedPolicy
    from '../layoutSys/sizePolicies/FixedPolicy';
import {HORIZONTAL, VERTICAL} from '.././const';


Theme.registerDefaultWidgetStyle('slider', {
    track: {
        enabled: 0x303030,
        disabled: 0x2e2e2e,
    },
    button: {
        enabled: 0x284328,
        disabled: 0x303030,
        hover: 0x264e26,
        click: 0x3a723a,
    },
});

/**
 * A button on a track used to manipulate a variable
 * @extends UI.Widgets.Container
 * @memberof UI.Widgets
 */
export default class Slider extends Container {
    /**
     * @param {UI.Widgets.BaseWidget} parent the widgets parent
     * @param {Number} orientation direction of slider
     * @param {Object} [options]
     */
    constructor(parent, orientation = HORIZONTAL, options) {
        super(parent, options);

        // this.idealThemeFrameNode = 'slider';
        // this.updateThemeTextureRoot();

        this._orientation = orientation;

        this.minValue = 0;
        this.maxValue = 1;

        this._value = 0;

        this.valueCB = null;

        this.padding.setAllTo(0);

        this.track = new Image(this, this.theme.texture);
        this.track.interactive = true;
        this.trackHitRect = new PIXI.Rectangle();
        this.track.hitArea = this.trackHitRect;
        this.trackHitPadding = 5;


        this.button = new Image(this, this.theme.texture, {
            width: 20,
            height: 20,
        });
        this.button.interactive = true;

        this.btnHalfWidth = this.button.width / 2;
        this.btnHalfHeight = this.button.height / 2;

        this._dragging = false;

        this.button.pointerdown = (e)=>{
            this._dragging = true;
            this.paintDown();
            // e.stopPropagation();
            // this.button.paintDown();
        };

        this.button.on('pointerup', (e)=>{
            this._dragging = false;
            this.paintDefault();
            // e.stopPropagation();
        });
        this.button.on('pointerupoutside', (e)=>{
            this._dragging = false;
            this.paintDefault();
            // e.stopPropagation();
        });
        this.button.on('pointercancel', (e)=>{
            this._dragging = false;
            this.paintDefault();
            // e.stopPropagation();
        });

        // this.button.pointerup
        // = this.button.pointerupoutside
        // = this.button.pointercancel
        // = (data)=>{
        //     this._dragging = false;
        //     this.paintDefault();
        //     // data.stopped = false;
        //     // this.button.paintDefault();
        // };
        //
        this.button.on('pointermove', (e)=>{
            if(this._dragging) {
                // e.stopPropagation();
              this.button.bypassInvalidation = true;
              let pos = e.data.getLocalPosition(this);
              let usableWidth = this.track.width - this.btnHalfWidth;
              let usableHeight = this.track.height - this.btnHalfHeight;
              if(this.orientation === UI.HORIZONTAL) {
                  if (pos.x > this.btnHalfWidth
                      && pos.x < usableWidth) {
                    // this.button.bypassInvalidation = true;
                    this.button.x = pos.x - this.btnHalfWidth;
                    this.button.applyPosition();
                    // this.button.bypassInvalidation = false;
                    this.emit('changed');
                } else if(pos.x > usableWidth) {
                    // this.button.bypassInvalidation = true;
                    this.button.x = usableWidth - this.btnHalfWidth;
                    this.button.applyPosition();
                    // this.button.bypassInvalidation = false;
                    this.emit('changed');
                } else if(pos.x < this.btnHalfWidth) {
                    // this.button.bypassInvalidation = true;
                    this.button.x = 0; // this.btnHalfWidth;
                    this.button.applyPosition();
                    // this.button.bypassInvalidation = false;
                    this.emit('changed');
                }
            } else { // vertical
                  if (pos.y > this.btnHalfHeight
                      && pos.y < usableHeight) {
                    // this.button.bypassInvalidation = true;
                    this.button.y = pos.y - this.btnHalfHeight;
                    this.button.applyPosition();
                    // this.button.bypassInvalidation = false;
                    this.emit('changed');
                } else if(pos.y > usableHeight) {
                    // this.button.bypassInvalidation = true;
                    this.button.y = usableHeight - this.btnHalfHeight;
                    this.button.applyPosition();
                    // this.button.bypassInvalidation = false;
                    this.emit('changed');
                } else if(pos.y < this.btnHalfHeight) {
                    // this.button.bypassInvalidation = true;
                    this.button.y = 0;// this.btnHalfHeight;
                    this.button.applyPosition();
                    // this.button.bypassInvalidation = false;
                    this.emit('changed');
                }
              }
              this.button.bypassInvalidation = false;
              this.paintDown();
            //   this.button.paintDown();
            }
        });

        // this.button.pointermove = (data)=>{
        //     if(this._dragging) {
        //         // data.stopPropagation();
        //       this.button.bypassInvalidation = true;
        //       let pos = data.data.getLocalPosition(this);
        //       let usableWidth = this.track.width - this.btnHalfWidth;
        //       let usableHeight = this.track.height - this.btnHalfHeight;
        //       if(this.orientation === UI.HORIZONTAL) {
        //           if (pos.x > this.btnHalfWidth
        //               && pos.x < usableWidth) {
        //             // this.button.bypassInvalidation = true;
        //             this.button.x = pos.x - this.btnHalfWidth;
        //             this.button.applyPosition();
        //             // this.button.bypassInvalidation = false;
        //             this.emit('changed');
        //         } else if(pos.x > usableWidth) {
        //             // this.button.bypassInvalidation = true;
        //             this.button.x = usableWidth - this.btnHalfWidth;
        //             this.button.applyPosition();
        //             // this.button.bypassInvalidation = false;
        //             this.emit('changed');
        //         } else if(pos.x < this.btnHalfWidth) {
        //             // this.button.bypassInvalidation = true;
        //             this.button.x = 0; // this.btnHalfWidth;
        //             this.button.applyPosition();
        //             // this.button.bypassInvalidation = false;
        //             this.emit('changed');
        //         }
        //     } else { // vertical
        //           if (pos.y > this.btnHalfHeight
        //               && pos.y < usableHeight) {
        //             // this.button.bypassInvalidation = true;
        //             this.button.y = pos.y - this.btnHalfHeight;
        //             this.button.applyPosition();
        //             // this.button.bypassInvalidation = false;
        //             this.emit('changed');
        //         } else if(pos.y > usableHeight) {
        //             // this.button.bypassInvalidation = true;
        //             this.button.y = usableHeight - this.btnHalfHeight;
        //             this.button.applyPosition();
        //             // this.button.bypassInvalidation = false;
        //             this.emit('changed');
        //         } else if(pos.y < this.btnHalfHeight) {
        //             // this.button.bypassInvalidation = true;
        //             this.button.y = 0;// this.btnHalfHeight;
        //             this.button.applyPosition();
        //             // this.button.bypassInvalidation = false;
        //             this.emit('changed');
        //         }
        //       }
        //       this.button.bypassInvalidation = false;
        //       this.paintDown();
        //     //   this.button.paintDown();
        //     }
        // };

        this.track.on('pointertap', (e)=>{
            let pos = e.data.getLocalPosition(this);
            if(this.orientation === UI.HORIZONTAL) {
                this.button.bypassInvalidation = true;
                if(pos.x > this.track.width - this.button.width) {
                    pos.x -= this.button.width;
                }
                this.button.x = pos.x;
                this.button.applyPosition();
                this.button.bypassInvalidation = false;
            } else {
                this.button.bypassInvalidation = true;
                if(pos.y > this.track.height - this.button.height) {
                    pos.y -= this.button.height;
                }
                this.button.y = pos.y;
                this.button.applyPosition();
                this.button.bypassInvalidation = false;
            }
            this.emit('changed');
            // e.stopPropagation();
        });
        // clicking on the track sets position of button
        // this.track.pointertap = (data)=>{
        //     let pos = data.data.getLocalPosition(this);
        //     if(this.orientation === UI.HORIZONTAL) {
        //         this.button.bypassInvalidation = true;
        //         if(pos.x > this.track.width - this.button.width) {
        //             pos.x -= this.button.width;
        //         }
        //         this.button.x = pos.x;
        //         this.button.applyPosition();
        //         this.button.bypassInvalidation = false;
        //     } else {
        //         this.button.bypassInvalidation = true;
        //         if(pos.y > this.track.height - this.button.height) {
        //             pos.y -= this.button.height;
        //         }
        //         this.button.y = pos.y;
        //         this.button.applyPosition();
        //         this.button.bypassInvalidation = false;
        //     }
        //     this.emit('changed');
        // };

        this.orientation = orientation;

        this.button.on('sizeChanged', ()=>{
            this.btnHalfWidth = this.button.width / 2;
            this.btnHalfHeight = this.button.height / 2;
        }, this);

        this.track.on('sizeChanged', ()=>{
            // this._value = this.oldValue;
            this.value = this._value;
        }, this);

        this.track.on('layoutUpdated', this.updateTrackHitRect, this);

        this.paintDefault();
    }

    /**
     *Update the filter area of the track to make it easier to
     *click on it.
     */
    updateTrackHitRect() {
        let thr = this.trackHitRect;
        if(this.orientation === HORIZONTAL) {
            thr.x = 0;
            thr.y = 0 - this.trackHitPadding;
            thr.width = this.track.width;
            thr.height = this.track.height + (this.trackHitPadding * 2);
        } else {
            thr.x = 0 - this.trackHitPadding;
            thr.y = 0;
            thr.width = this.track.width + (this.trackHitPadding * 2);
            thr.height = this.track.height;
        }
    }

    /**
     * @inheritdoc
     */
    paintDefault() {
        // no need to check track too. If button exist track does to
        if(this.button) {
            this.track.imgObj.texture
                = this.theme.textures.slider.track.enabled;
            this.button.imgObj.texture
                = this.theme.textures.slider.button.enabled;
        }
    }

    /**
     * @inheritdoc
     */
    paintDisabled() {
        if(this.button) {
            this.track.imgObj.texture
                = this.theme.textures.slider.track.disabled;
            this.button.imgObj.texture
                = this.theme.textures.slider.button.disabled;
        }
    }

    /**
     * @inheritdoc
     */
    paintDown() {
        // this.track.imgObj.texture.frame
        //     = this.theme.frames.slider.track.disabled;
        if(this.button) {
            this.button.imgObj.texture
                = this.theme.textures.slider.button.click;
        }
    }

    /**
     * @inheritdoc
     */
    paintHover() {
        // this.track.imgObj.texture.frame
        //     = this.theme.frames.slider.track.disabled;
        if(this.button) {
            this.button.imgObj.texture
                = this.theme.textures.slider.button.hover;
        }
    }

    /**
     *@type {Number}
     */
    get value() {
        if(this.orientation === HORIZONTAL) {
            let value =
                (((this.maxValue - this.minValue)
                    / (this.track.width - this.button.width))
                    * this.button.x) + this.minValue;

                this._value = value;

            if(this.valueCB) {
                return this.valueCB(value);
            } else {
                return value;
            }
        } else {
            let value =
                (((this.maxValue - this.minValue)
                    / (this.track.height - this.button.height))
                    * this.button.y) + this.minValue;

                this._value = value;

            if(this.valueCB) {
                return this.valueCB(value);
            } else {
                return value;
            }
        }
    }

    set value(val) { // eslint-disable-line require-jsdoc
        val = Math.min(Math.max(val, this.minValue), this.maxValue);
        this.oldValue = this._value = val;
        this.button.beginBypassUpdate();
        if(this.orientation === HORIZONTAL) {
            let pos
            = ((val - this.minValue) / (this.maxValue - this.minValue))
            * (this.track.width - this.button.width);

            // this.button.beginBypassUpdate();
            this.button.x = pos;
            this.button.applyPosition();
            // this.button.endBypassUpdate();
        } else {
            let pos
            = ((val - this.minValue) / (this.maxValue - this.minValue))
            * (this.track.height - this.button.height);

            // this.button.beginBypassUpdate();
            this.button.y = pos;
            this.button.applyPosition();
            // this.button.endBypassUpdate();
        }
        this.button.endBypassUpdate();
        this.emit('changed');
    }

    /**
     * @type {Number}
     */
    get orientation() {
        return this._orientation;
    }

    set orientation(val) { // eslint-disable-line require-jsdoc
        if(val === HORIZONTAL) {
            this._orientation = val;
            this.min.height = this.button.height;
            this.min.width = 30;
            this.max.height = this.min.height;
            this.max.width = 10000;
            // this.updateTrackH();
            this.track.width = this.width;
            this.track.height = 5;
            this.layout.alignment.hAlign = Alignment.left;
            this.layout.alignment.vAlign = Alignment.middle;
            this.track.hPolicy
                = new ExpandingPolicy(this.track, HORIZONTAL);
            this.track.vPolicy = new FixedPolicy(this.track);
        } else if(val === VERTICAL) {
            this._orientation = val;
            this.min.height = 30;
            this.min.width = this.button.width;
            this.max.height = 10000;
            this.max.width = this.min.width;
            // this.updateTrackV();

            this.track.width = 5;
            this.track.height = this.height;
            this.layout.alignment.hAlign = Alignment.center;
            this.layout.alignment.vAlign = Alignment.top;
            this.track.vPolicy
                = new ExpandingPolicy(this.track, VERTICAL);
            this.track.hPolicy = new FixedPolicy(this.track);
        } else {
            throw new Error('Slider.orientation must be either UI.HORIZONTAL'
                + ' or UI.VERTICAL');
        }
    }
}
