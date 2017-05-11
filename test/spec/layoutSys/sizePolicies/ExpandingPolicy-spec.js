'use strict';

describe('ExpandingPolicy', ()=>{
    let widget0 = new ST.Widgets.Button();
    widget0.width = 200; widget0.height = 200;
    let widget1 = new ST.Widgets.Button(widget0);
    widget1.hPolicy = new ST.SizePolicies.ExpandingPolicy(widget1);
    widget1.vPolicy = new ST.SizePolicies.ExpandingPolicy(widget1);
    widget1.width = 100; widget1.height = 100;

    describe('#parentReadyH', ()=>{
        it('should size the widget to match its parents width - padding', ()=>{
            expect(widget1.width).to.equal(100);
            widget1.hPolicy.parentReadyH();
            expect(widget1.width).to.equal(192);
        });
    });

    describe('#parentReadyV', ()=>{
        it('should size the widget to match its parents height - padding', ()=>{
            expect(widget1.height).to.equal(100);
            widget1.vPolicy.parentReadyV();
            expect(widget1.height).to.equal(192);
        });
    });
});
