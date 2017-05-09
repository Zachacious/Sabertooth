'use strict';

describe('Theme', ()=>{
    let greyToadTheme = require('../../themes/greyToadTheme');
    // let change one style because this theme is the same as the defaults
    greyToadTheme.background = 0xffffff;
    greyToadTheme.widgets.button.hover = 0xff00ff;
    let theme = new ST.Theme(greyToadTheme);
    let defTheme = new ST.Theme();

    it('should load the given styles when created', ()=>{
        expect(theme.background).to.equal(0xffffff);
        expect(theme.colors.button.hover).to.equal(0xff00ff);
        // not gonna check each one. This should be enough
    });

    it('should load the default styles if no style is given', ()=>{
        expect(defTheme.background).to.equal(0x222222);
        expect(defTheme.colors.button.hover).to.equal(0x264e26);
        // not gonna check each one. This should be enough
    });

    describe('#colors', ()=>{
        it('should equal the widgets portion of the styles', ()=>{
            expect(theme.colors).to.deep.equal(greyToadTheme.widgets);
        });
    });

    describe('#fonStyles', ()=>{
        it('should equal the fontStyles portion of the styles', ()=>{
            expect(theme.fontStyles).to.deep.equal(greyToadTheme.fontStyles);
        });
    });

    describe('#frames', ()=>{
        it('should contain rects in the structure of the widgets' +
            ' portion of the styles', ()=>{
                // try a few of them
                expect(theme.frames.button.enabled).to.be.an
                    .instanceof(PIXI.Rectangle);
                expect(theme.frames.panel.hover).to.be.an
                    .instanceof(PIXI.Rectangle);
                expect(theme.frames.slider.button.enabled).to.be.an
                    .instanceof(PIXI.Rectangle);
            });
    });

    describe('#baseTexture', ()=>{
        it('should be a PIXI.BaseTexture', ()=>{
            expect(theme.baseTexture).to.be.an.instanceof(PIXI.BaseTexture);
        });
    });

    describe('#textures', ()=>{
        it('should contain textures in the structure of the widgets' +
            ' portion of the styles', ()=>{
                // try a few of them
                expect(theme.textures.button.enabled).to.be.an
                    .instanceof(PIXI.Texture);
                expect(theme.textures.panel.hover).to.be.an
                    .instanceof(PIXI.Texture);
                expect(theme.textures.slider.button.enabled).to.be.an
                    .instanceof(PIXI.Texture);
            });
    });

    describe('#background', ()=>{
        it('should equal the color given in the style', ()=>{
            expect(theme.background).to.equal(0xffffff);
        });
    });

    describe('#getClipGraphic() (STATIC)', ()=>{
        it('should return the global clipGraphic', ()=>{
            expect(theme.getClipGraphic()).to.be.an
                .instanceof(PIXI.clipGraphic);
        });
    });

    decribe('#registerDefaultWidgetStyle() (STATIC)', ()=>{
        it('should add the given style to theme.defaults(global)', ()=>{
            let style = {
                knob: {
                    enabled: 0x000000,
                    disabled: 0xffffff,
                },
            };

            ST.Theme.registerDefaultWidgetStyle('pane', style);

            expect(ST.Theme.defaults.widgets.pane.knob.enabled)
                .to.equal(0x000000);

            expect(ST.Theme.defaults.widgets.pane.knob.disabled)
                .to.equal(0xffffff);
        });
    });

    describe('#makeGraphicsRecursive()', ()=>{
        // not needed if frames test above passes
    });

    describe('#makeTexture()', ()=>{
        // not needed if baseTexture test above passes
    });

    describe('#makeTexturesRecursive()', ()=>{
        // not needed if textures text above passes
    });
});
