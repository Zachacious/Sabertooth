'use strict';

describe('Padding', ()=>{
    let pad = new UI.Padding();
    it('should be created with a default of 0', ()=>{
        expect(pad.left).to.equal(0);
        expect(pad.top).to.equal(0);
        expect(pad.right).to.equal(0);
        expect(pad.bottom).to.equal(0);
    });

    describe('#set()', ()=>{
        it('should set each padding to the values of 1,2,3,4', ()=>{
            pad.set(1, 2, 3, 4);
            expect(pad.left).to.equal(2);
            expect(pad.top).to.equal(1);
            expect(pad.right).to.equal(4);
            expect(pad.bottom).to.equal(3);
        });
    });

    describe('#setAllTo()', ()=>{
        it('should set all padding values to 10', ()=>{
            pad.setAllTo(10);
            expect(pad.left).to.equal(10);
            expect(pad.top).to.equal(10);
            expect(pad.right).to.equal(10);
            expect(pad.bottom).to.equal(10);
        });
    });
});
