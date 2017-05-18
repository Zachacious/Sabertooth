'use strict';

/*
TODO:
test things that should happen when events are fired.
eg. when padding changes _updateClipGraphic should be called.
 */

describe('BaseWidget', ()=>{
    let widget0 = new ST.Widgets.Panel();
    let widget1 = new ST.Widgets.Panel(widget0);
    let widget2 = new ST.Widgets.Panel(widget1);

    beforeEach(()=>{
        widget1.layout
            = new ST.Layouts.FixedLayout(widget1);
        widget2.hPolicy
            = new ST.SizePolicies.FixedPolicy(widget2);
        widget0.hPolicy
            = new ST.SizePolicies.FixedPolicy(widget0);
        widget1.validate();
        widget0.validate();
        widget2.validate();
    });

    it('should parent one widget to another', ()=>{
        expect(widget2.parent).to.equal(widget1);
    });

    describe('#beginBypassUpdate()', ()=>{

    });

    describe('#endBypassUpdate()', ()=>{

    });

    describe('#validateWidth()', ()=>{
        it('should keep widgets width within min/max', ()=>{
            widget2.min.width = 10;
            widget2.max.width = 80;
            widget2.width = 100;
            widget2.validateWidth();
            expect(widget2.width).to.equal(80);
            widget2.width = 5;
            widget2.validateWidth();
            expect(widget2.width).to.equal(10);
        });
    });

    describe('#validateHeight()', ()=>{
        it('should keep widgets height within min/max', ()=>{
            widget2.min.height = 10;
            widget2.max.height = 80;
            widget2.height = 100;
            widget2.validateHeight();
            expect(widget2.height).to.equal(80);
            widget2.height = 5;
            widget2.validateHeight();
            expect(widget2.height).to.equal(10);
        });
    });

    describe('#update()', ()=>{

    });

    describe('#validate()', ()=>{

    });

    describe('#invalidate()', ()=>{

    });

    describe('#routeInvalidation()', ()=>{
        it('should invalidate the highest parent', ()=>{
            widget1.layout
                = new ST.Layouts.HBoxLayout(widget1);
            widget2.layout
                = new ST.Layouts.HBoxLayout(widget2);
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

    describe('#renderCanvas()', ()=>{

    });

    describe('#renderWebGL()', ()=>{

    });

    describe('#setParent()', ()=>{

    });

    describe('#addChild', ()=>{
        it('should set each PIXI.Containers mask to null', ()=>{
                let pc = new PIXI.Container();
                widget2.addChild(pc);
                expect(pc.mask).to.be.null;
        });

        it('should add its theme to each BaseWidget child added', ()=>{
            expect(widget2.theme).to.equal(widget1.theme);
        });

        it('should set mask to null if child has updateOnHostChanges = false '
            + 'for both size policies', ()=>{
                // should set to parent
            widget1.layout = new ST.Layouts.VBoxLayout(widget1);
            widget2.hPolicy
            = new ST.SizePolicies.FixedPolicy(widget2);

            expect(widget2.sizeProxy.mask).to.equal(widget1.clipGraphic);

            widget2.hPolicy
            = new ST.SizePolicies.ExpandingPolicy(widget2, ST.HORIZONTAL);
            widget2.vPolicy
            = new ST.SizePolicies.ExpandingPolicy(widget2, ST.VERTICAL);

            expect(widget2.sizeProxy.mask).to.be.null;
        });

    it('should mask children if its layout has updateOnHostChanges = true',
        ()=>{
            widget1.layout = new ST.Layouts.FixedLayout(widget1);
            expect(widget2.sizeProxy.mask).to.equal(widget1.clipGraphic);
        });

        // it('should add its clipGraphic to each BaseWidget child addeds'
        //     + ' size proxy', ()=>{
        //     expect(widget2.sizeProxy.mask).to.equal(widget1.clipGraphic);
        // });
    });

    describe('#addChildAt()', ()=>{
        // same as #addChild
    });

    describe('#onChildrenChange()', ()=>{

    });

    describe('#applyPosition()', ()=>{

    });

    describe('_updateClipGraphic()', ()=>{
        it('should set to size of widget - padding', ()=>{
            widget2.vPolicy
            = new ST.SizePolicies.FixedPolicy(widget2);
            widget2.max.width = 1000;
            widget2.max.height = 1000;
            widget2.width = 400;
            widget2.height = 400;
            widget1.update(); // should call _updateClipGraphic()
            expect(widget2.clipGraphic.width).to.equal(392);
            expect(widget2.clipGraphic.height).to.equal(392);
        });

        it('should set the pos to the top left padding values', ()=>{
            expect(widget2.clipGraphic.x).to.equal(4);
            expect(widget2.clipGraphic.y).to.equal(4);
        });

        it('should set renderable to false', ()=>{
            expect(widget2.clipGraphic.renderable).to.be.false;
        });
    });

    describe('#theme', ()=>{
        let aThm = new ST.Theme();
        it('should apply the set theme to children recursively', ()=>{
            widget0.theme = aThm;
            expect(widget1.theme).to.equal(widget0.theme);
            expect(widget2.theme).to.equal(widget1.theme);
        });
    });

    describe('#disabled', ()=>{
        it('should disable itself and its children when set to false', ()=>{
            widget0.disabled = true;
            expect(widget0.disabled).to.be.true;
            expect(widget1.disabled).to.be.true;
            expect(widget2.disabled).to.be.true;
        });

        it('should enable itself and its children when set to true', ()=>{
            widget0.disabled = false;
            expect(widget0.disabled).to.be.false;
            expect(widget1.disabled).to.be.false;
            expect(widget2.disabled).to.be.false;
        });
    });

    describe('#_evaluateMask()', ()=>{
        it('should mask all children if layout.updateOnHostChanges = true',
        ()=>{
            widget0.layout = new ST.Layouts.FixedLayout(widget0);
            expect(widget1.mask).to.equal(widget0.clipGraphic);
        });

        it('should mask child if either policy has updateOnHostChanges true'
        + ' and the parents layout has updateOnHostChanges false', ()=>{
            widget0.layout = new ST.Layouts.VBoxLayout(widget0, ST.VERTICAL);
            widget1.hPolicy = new ST.SizePolicies.FixedPolicy(widget1);
            expect(widget1.mask).to.equal(widget0.clipGraphic);
        });

        it('should set mask to null if layout has updateOnHostChanges false '
        + 'and childs policies have updateOnHostChanges false', ()=>{
            widget0.layout = new ST.Layouts.VBoxLayout(widget0, ST.VERTICAL);
            widget1.hPolicy
            = new ST.SizePolicies.ExpandingPolicy(widget1, ST.HORIZONTAL);
            widget1.vPolicy
            = new ST.SizePolicies.ExpandingPolicy(widget1, ST.VERTICAL);
            expect(widget1.mask).to.be.null;
        });

        it('should set mask to null if child is not a widget', ()=>{
            let pc = new PIXI.Container();
            widget0.addChild(pc);
            widget0._evaluateMask();
            expect(pc.mask).to.be.null;
        });
    });
});
