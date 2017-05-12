'use strict';

describe('HBoxLayout', ()=>{
    it('should construct a BoxLayout with HORIZONTAL orientation', ()=>{
        let w1 = new ST.Widgets.Panel();

        w1.layout = new ST.Layouts.HBoxLayout(w1);
        expect(w1.layout.orientation).to.equal(ST.HORIZONTAL);
    });
});
