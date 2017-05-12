'use strict';

describe('SharedExpandingPolicy', ()=>{
    let widget0 = new ST.Widgets.Panel(null, {width: 400, height: 400});
    widget0.layout = new ST.Layouts.HBoxLayout(widget0);

    let widget1 = new ST.Widgets.Button(widget0);
    widget1.hPolicy = new ST.SizePolicies.SharedExpandingPolicy(widget1);
    widget1.vPolicy
    = new ST.SizePolicies.SharedExpandingPolicy(widget1, ST.VERTICAL);

    let widget2 = new ST.Widgets.Button(widget0);
    widget2.hPolicy = new ST.SizePolicies.SharedExpandingPolicy(widget2);
    widget2.vPolicy
    = new ST.SizePolicies.SharedExpandingPolicy(widget2, ST.VERTICAL);

    describe('#parentReadyH', ()=>{
        it('should size the widgets equal size if all have shared policy', ()=>{
            widget0.hPolicy.exec();
            expect(widget1.width).to.equal(194);
            expect(widget2.width).to.equal(194);
        });

        it('should handle widgets that arent of shared policy', ()=>{
            let nullwidget = new ST.Widgets.Panel();
            let widget3
            = new ST.Widgets.Button(widget0, {width: 100, height: 100});
            widget3.hPolicy = new ST.SizePolicies.FixedPolicy(widget3);
            widget0.hPolicy.exec();
            expect(widget1.width).to.equal(142);
            expect(widget2.width).to.equal(142);
            expect(widget3.width).to.equal(100);
            nullwidget.addChild(widget3);
        });
    });

    describe('#parentReadyV', ()=>{
        it('should size the widgets equal size if all have shared policy', ()=>{
            /*
                same as above test.
             */
        });

        it('should handle widgets that arent of shared policy', ()=>{
            /*
                same as above test.
             */
        });
    });

    describe('#consumeUnusedSpaceH()', ()=>{
        // TODO
    });

    describe('#consumeUnusedSpaceV()', ()=>{
        // TODO
    });
});
