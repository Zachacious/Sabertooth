'use strict';

describe('SITransform', ()=>{
    it('should allow a widget to transform its dimensions'
        + ' independent from its parent', ()=>{
            let widget0 = new UI.Widgets.Panel();
            widget0.width = 1000;
            let widget1 = new UI.Widgets.Panel();
            widget1.width = 200;
            widget0.addChild(widget1);
            widget0.width = 500;
            expect(widget1.width).to.equal(200);
        });
});
