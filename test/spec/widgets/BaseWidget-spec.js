'use strict';

/*
TODO:
test things that should happen when events are fired.
eg. when padding changes _updateClipGraphic should be called.
 */

describe('BaseWidget', ()=>{
    let widget0 = new UI.Widgets.BaseWidget();
    let widget1 = new UI.Widgets.BaseWidget(widget0);
    let widget2 = new UI.Widgets.BaseWidget(widget1);

    beforeEach(()=>{
        widget1.layout
            = new UI.Layouts.FixedLayout(widget1);
        widget2.hPolicy
            = new UI.Layouts.FixedLayout(widget2);
        widget0.hPolicy
            = new UI.Layouts.FixedLayout(widget0);
        widget1.validate();
        widget0.validate();
        widget2.validate();
    });

    it('should parent one widget to another', ()=>{
        expect(widget2.parent).to.equal(widget1);
    });

    describe('#routeInvalidation()', ()=>{
        it('should invalidate the highest parent', ()=>{
            widget1.layout
                = new UI.Layouts.HBoxLayout(widget1);
            widget2.hPolicy
                = new UI.Layouts.HBoxLayout(widget2);
                widget2.routeInvalidation();
                expect(widget0.valid).to.be.false;
                expect(widget1.valid).to.be.true;
                expect(widget2.valid).to.be.true;
        });

        it('should invalidate the first parent with a fixed size policy', ()=>{
            widget2.routeInvalidation();
            expect(widget0.valid).to.be.true;
            expect(widget1.valid).to.be.false;
            expect(widget2.valid).to.be.true;
        });
    });

    describe('#recursiveRouteUpdate()', ()=>{
        it('should route update to itself if no parent exist', ()=>{
            let updateSpy = sinon.spy(widget0, 'update');
            widget0.recursiveRouteUpdate();
            expect(updateSpy.called).to.be.true;
            widget0.update.restore();
        });

        it('should recursivley run this function if the parent is valid', ()=>{
            widget1.invalidate();
            let spy = sinon.spy(widget1, 'recursiveRouteUpdate');
            widget2.recursiveRouteUpdate();
            expect(spy.called).to.be.true;
            widget1.recursiveRouteUpdate.restore();
        });

        it('should route update to itself if parent is valid', ()=>{
            let updateSpy = sinon.spy(widget0, 'update');
            widget0.recursiveRouteUpdate();
            expect(updateSpy.called).to.be.true;
            widget0.update.restore();
        });
    });

    describe('#addChild', ()=>{
        it('should add its clipGraphic to each PIXI.Container '
            + 'child added', ()=>{
                let pc = new PIXI.Container();
                widget2.addChild(pc);
                expect(pc.mask).to.equal(widget2.clipGraphic);
        });

        it('should add its theme to each BaseWidget child added', ()=>{
            expect(widget2.theme).to.equal(widget1.theme);
        });

        it('should add its clipGraphic to each BaseWidget child addeds'
            + ' size proxy', ()=>{
            expect(widget2.sizeProxy.mask).to.equal(widget1.clipGraphic);
        });
    });

    describe('#theme', ()=>{
        let aThm = new UI.Theme();
        it('should apply the set theme to children recursively', ()=>{
            widget0.theme = aThm;
            expect(widget1.theme).to.equal(widget0.theme);
            expect(widget2.theme).to.equal(widget1.theme);
        });
    });
});
