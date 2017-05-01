'use strict';

describe('ExpandingPolicy', ()=>{
    let widget0 = new UI.Widgets.Button();
    widget0.width = 200; widget0.height = 200;
    let widget1 = new UI.Widgets.Button(widget0);
    widget1.hPolicy = new UI.SizePolicies.ExpandingPolicy(widget1);
    widget1.vPolicy = new UI.SizePolicies.ExpandingPolicy(widget1);
    widget1.width = 100; widget1.height = 100;
    // describe('sizeWidgetHorizontal', ()=>{
    //     it('should add (this.parentReadyH) listener'
    //         + ' to its parent if one exist', ()=>{
    //         expect(widget0.hPolicy.listeners('finished', true)).to.be.false;
    //         widget1.hPolicy.sizeWidgetHorizontal();
    //         expect(widget0.hPolicy.listeners('finished', true)).to.be.true;
    //     });

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
