'use strict';

describe('SharedExpandingPolicy', ()=>{
    let widget0 = new UI.Widgets.Panel(null, {width: 400, height: 400});
    widget0.layout = new UI.Layouts.HBoxLayout(widget0);

    let widget1 = new UI.Widgets.Button(widget0);
    widget1.hPolicy = new UI.SizePolicies.SharedExpandingPolicy(widget1);
    widget1.vPolicy
    = new UI.SizePolicies.SharedExpandingPolicy(widget1, UI.VERTICAL);

    let widget2 = new UI.Widgets.Button(widget0);
    widget2.hPolicy = new UI.SizePolicies.SharedExpandingPolicy(widget2);
    widget2.vPolicy
    = new UI.SizePolicies.SharedExpandingPolicy(widget2, UI.VERTICAL);

    describe('#parentReadyH', ()=>{
        it('should size the widgets equal size if all have shared policy', ()=>{
            widget0.hPolicy.exec();
            expect(widget1.width).to.equal(194);
            expect(widget2.width).to.equal(194);
        });

        it('should handle widgets that arent of shared policy', ()=>{
            let nullwidget = new UI.Widgets.Panel();
            let widget3
            = new UI.Widgets.Button(widget0, {width: 100, height: 100});
            widget3.hPolicy = new UI.SizePolicies.FixedPolicy(widget3);
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
});
