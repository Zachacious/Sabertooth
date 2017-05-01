'use strict';

describe('VBoxLayout', ()=>{
    it('should construct a BoxLayout with VERTICAL orientation', ()=>{
        let w1 = new UI.Widgets.Panel();

        w1.layout = new UI.Layouts.VBoxLayout(w1);
        expect(w1.layout.orientation).to.equal(UI.VERTICAL);
    });
});
