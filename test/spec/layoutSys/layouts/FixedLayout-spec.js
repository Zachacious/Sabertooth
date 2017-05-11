'use strict';

describe('FixedLayout', ()=>{
    let w0 = new ST.Widgets.Panel(null, {width: 400, height: 400});
    let w1 = new ST.Widgets.Button(w0);
    w1.position.set(12, 12);

    describe('#setChildPos()', ()=>{
        it('should set the childs position', ()=>{
            expect(w1.transform.position.x).to.equal(0);
            expect(w1.transform.position.y).to.equal(0);

            w0.layout.setChildPos(w1);

            expect(w1.transform.position.x).to.equal(16);
            expect(w1.transform.position.y).to.equal(16);
        });
    });
});
