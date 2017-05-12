'use strict';

describe('VBoxLayout', ()=>{
    it('should construct a BoxLayout with VERTICAL orientation', ()=>{
        let w1 = new ST.Widgets.Panel();

        w1.layout = new ST.Layouts.VBoxLayout(w1);
        expect(w1.layout.orientation).to.equal(ST.VERTICAL);
    });
});
