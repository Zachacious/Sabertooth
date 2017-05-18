'use strict';

/*
TODO:
test things that should happen when events are fired.
eg. when padding changes _updateClipRect should be called.
 */

describe('BaseWidget', ()=>{
    let widget0 = new ST.Widgets.BaseWidget();
    let widget1 = new ST.Widgets.BaseWidget(widget0);
    let widget2 = new ST.Widgets.BaseWidget(widget1);

    beforeEach(()=>{
        widget1.layout
            = new ST.Layouts.FixedLayout(widget1);
        widget2.hPolicy
            = new ST.Layouts.FixedLayout(widget2);
        widget0.hPolicy
            = new ST.Layouts.FixedLayout(widget0);
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
            widget2.hPolicy
                = new ST.Layouts.HBoxLayout(widget2);
                widget2.routeInvalidation();
                expect(widget0.valid).to.be.false;
                expect(widget1.valid).to.be.true;
                expect(widget2.valid).to.be.true;
        });

        it('should invalidate the first parent with a layout that has '
            + 'updateOnHostChanges = true', ()=>{
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
        it('should add its clipRect to mask each PIXI.Container '
            + 'child added if child.layout.updateOnHostChanges = true', ()=>{
                let pc = new PIXI.Container();
                widget2.addChild(pc);
                expect(pc.mask).to.equal(widget2.clipRect);
        });

        it('should let childs mask = null for PIXI.Containers '
            + 'if child.layout.updateOnHostChanges = false', ()=>{
                let pc = new PIXI.Container();
                pc.layout = new ST.Layouts.VBoxLayout(pc);
                widget2.addChild(pc);
                expect(pc.mask).to.equal(null);
            });

        it('should add its theme to each BaseWidget child added', ()=>{
            expect(widget2.theme).to.equal(widget1.theme);
        });

        it('should add its clipRect to mask each BaseWidget child addeds'
            + ' size proxy if child.layout.updateOnHostChanges = true', ()=>{
            expect(widget2.sizeProxy.mask).to.equal(widget1.clipRect);
        });

        it('should let childs mask = null for widgets '
            + 'if child.layout.updateOnHostChanges = false', ()=>{
                let w = new ST.Widgets.Button();
                w.layout = new ST.Layouts.VBoxLayout(w);
                widget2.addChild(w);
                expect(w.mask).to.equal(null);
            });
    });

    describe('#addChildAt()', ()=>{
        // same as #addChild
    });

    describe('#onChildrenChange()', ()=>{

    });

    describe('#applyPosition()', ()=>{

    });

    describe('_updateClipRect()', ()=>{
        it('should set to size of widget - padding', ()=>{
            widget2.max.width = 1000;
            widget2.max.height = 1000;
            widget2.width = 400;
            widget2.height = 400;
            widget1.update(); // should call _updateClipRect()
            expect(widget2.clipRect.width).to.equal(392);
            expect(widget2.clipRect.height).to.equal(392);
        });

        it('should set the pos to the top left padding values', ()=>{
            expect(widget2.clipRect.x).to.equal(4);
            expect(widget2.clipRect.y).to.equal(4);
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

    describe('#layout', ()=>{
        it('should set mask to null if '
            + 'widget.layout.updateOnHostChanges = false', ()=>{
                widget1.layout = new ST.Layouts.VBoxLayout(widget1);
                widget1.layout = new ST.Layouts.FixedLayout(widget1);
                expect(widget1.mask).to.be.null;
        });

        it('should set mask to parents clipRect if'
            + 'widget.layout.updateOnHostChanges = true', ()=>{
                widget1.layout = new ST.Layouts.VBoxLayout(widget1);
                expect(widget1.mask).to.equal(widget0.clipRect);
        });
    });
});
