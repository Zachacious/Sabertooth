'use strict';

describe('UIGraphics', ()=> {
    let uig = new UI.UIGraphics();
    let thm = new UI.Theme();
    describe('#makeGraphicsFromTheme()', ()=> {
        it('should pass a valid theme param', ()=>{
            expect(()=>{
                uig.makeGraphicsFromTheme(thm);
            }).to.not.throw(Error);
        });

        it('should throw a TypeError if invalid theme passed', ()=>{
            expect(()=>{
                uig.makeGraphicsFromTheme('invalid theme');
            }).to.throw(TypeError);
        });
    });
});
