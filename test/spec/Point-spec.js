'use strict';

describe('Point', ()=>{
    let p = new ST.Point();
    it('should create with default x and y of 0', ()=>{
        expect(p.x).to.equal(0);
        expect(p.y).to.equal(0);
    });
    describe('#set()', ()=>{
        it('should set x and y to 20, 80', ()=>{
            p.set(20, 80);
            expect(p.x).to.equal(20);
            expect(p.y).to.equal(80);
        });
    });
});
