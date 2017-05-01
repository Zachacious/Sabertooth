'use strict';

describe('Size', ()=>{
    let s = new UI.Size();
    it('should create with default size of 0', ()=>{
        expect(s.width).to.equal(0);
        expect(s.height).to.equal(0);
    });
    describe('#set()', ()=>{
        it('should set width and height to 20, 80', ()=>{
            s.set(20, 80);
            expect(s.width).to.equal(20);
            expect(s.height).to.equal(80);
        });
    });
});
