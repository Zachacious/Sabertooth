'use strict';

describe('GraphicsGen', ()=>{
    describe('#rectangleGraphic()', ()=>{
        it('should return a Pixi.Graphics with a '
            + 'width of 80 and a height of 100', ()=>{
                let rectGraphic =
                    ST.GraphicsGen.rectangleGraphic(80, 100, 0x000000);

                expect(rectGraphic).to.be.an.instanceof(PIXI.Graphics);
                expect(rectGraphic.width).to.equal(80);
                expect(rectGraphic.height).to.equal(100);
            });
    });

    describe('#rectangleTexture()', ()=>{
        it('should return a PIXI.Texture with a'
            + ' width of 100 and a height of 80', ()=>{
                let rectTex =
                    ST.GraphicsGen.rectangleTexture(100, 80, 0x000000);

                expect(rectTex).to.be.an.instanceof(PIXI.Texture);
                expect(rectTex.width).to.equal(100);
                expect(rectTex.height).to.equal(80);
            });
    });
});
