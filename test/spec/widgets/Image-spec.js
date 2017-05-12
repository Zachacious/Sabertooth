'use strict';

describe('Image', ()=>{
    let sprite = new PIXI.Sprite();
    let texture = new PIXI.Texture();
    let image = new ST.Widgets.Image();

    describe('#sprite', ()=>{
        it('should set the sprite for the image', ()=>{
            image.sprite = sprite;
            expect(image._sprite).to.equal(sprite);

            // shouldnt set texture to sprite
            image.sprite = texture;
            expect(image._sprite).to.equal(sprite);
        });
    });

    describe('#texture', ()=>{
        it('should set the sprites texture', ()=>{
            image.texture = texture;
            expect(image._sprite.texture).to.equal(texture);

            // shouldnt set sprite for texture
            image.texture = sprite;
            expect(image._sprite.texture).to.equal(texture);
        });
    });
});
