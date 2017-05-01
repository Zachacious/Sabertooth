'use strict';

describe('HBoxLayout', ()=>{
    it('should construct a BoxLayout with HORIZONTAL orientation', ()=>{
        let w1 = new UI.Widgets.Panel();

        w1.layout = new UI.Layouts.HBoxLayout(w1);
        expect(w1.layout.orientation).to.equal(UI.HORIZONTAL);
    });
});
