'use strict';

describe('BasePolicy', ()=>{
    let widget = new ST.Widgets.Button();

    describe('#setWidgetWidth()', ()=>{
        it('should set a widgets sizeProxys width', ()=>{
            widget.hPolicy.setWidgetWidth(widget, 100);
            expect(widget.sizeProxy._width).to.equal(100);
        });
    });

    describe('#setWidgetHeight()', ()=>{
        it('should set a widgets sizeProxys height', ()=>{
            widget.hPolicy.setWidgetHeight(widget, 100);
            expect(widget.sizeProxy._height).to.equal(100);
        });
    });

    describe('#validateWidth()', ()=>{
        it('should keep widgets width within min/max', ()=>{
            widget.min.width = 10;
            widget.max.width = 80;
            widget.width = 100;
            widget.hPolicy.validateWidth();
            expect(widget.width).to.equal(80);
            widget.width = 5;
            widget.hPolicy.validateWidth();
            expect(widget.width).to.equal(10);
        });
    });

    describe('#validateHeight()', ()=>{
        it('should keep widgets height within min/max', ()=>{
            widget.min.height = 10;
            widget.max.height = 80;
            widget.height = 100;
            widget.hPolicy.validateHeight();
            expect(widget.height).to.equal(80);
            widget.height = 5;
            widget.hPolicy.validateHeight();
            expect(widget.height).to.equal(10);
        });
    });

    describe('#childPolicyFinished()', ()=>{
        it('should add each childs size to totalChildrenFinishedSize and'
            + ' substract 1 from totalChildrenFinished', ()=>{
                widget.hPolicy.totalChildrenFinished = 1;
                widget.hPolicy.totalChildrenFinishedSize = 100;
                widget.hPolicy.childPolicyFinished(400);

                expect(widget.hPolicy.totalChildrenFinished).to.equal(0);
                expect(widget.hPolicy.totalChildrenFinishedSize).to.equal(500);
            });
    });

    describe('#exec()', ()=>{
        let widget2 = new ST.Widgets.Button(widget);

        it('should add a one time event'
        + '( register size with childPolicyFinished ) and exec the '
        + 'HORIZONTAL size policy for each child '
        + 'that is HORIZONTAL and an instanceof ST.Widgets.BaseWidget', ()=>{
            let spy = sinon.spy(widget2.hPolicy, 'exec');
            expect(widget2.hPolicy.listeners('finished', true)).to.be.false;
            expect(widget2).to.be.an.instanceof(ST.Widgets.BaseWidget);
            expect(widget.hPolicy.orientation).to.equal(ST.HORIZONTAL);
            widget.hPolicy.exec();

            expect(spy.called).to.be.true;
            widget2.hPolicy.exec.restore();
        });

        it('should add a one time event'
        + '( register size with childPolicyFinished ) and exec the '
        + 'VERTICAL size policy for each child '
        + 'that is VERTICAL and an instanceof ST.Widgets.BaseWidget', ()=>{
            let spy = sinon.spy(widget2.vPolicy, 'exec');
            expect(widget2.vPolicy.listeners('finished', true)).to.be.false;
            expect(widget2).to.be.an.instanceof(ST.Widgets.BaseWidget);
            expect(widget.vPolicy.orientation).to.equal(ST.VERTICAL);
            widget.vPolicy.exec();

            expect(spy.called).to.be.true;
            widget2.vPolicy.exec.restore();
        });

        it('should call sizeWidgetHorizontal() if the widget is HORIZONTAL',
        ()=>{
            let spy = sinon.spy(widget.hPolicy, 'sizeWidgetHorizontal');
            widget.hPolicy.exec();
            expect(spy.called).to.be.true;
            widget.hPolicy.sizeWidgetHorizontal.restore();
        });

        it('should call sizeWidgetVertical() if the widget is VERTICAL',
        ()=>{
            let spy = sinon.spy(widget.vPolicy, 'sizeWidgetVertical');
            widget.vPolicy.exec();
            expect(spy.called).to.be.true;
            widget.vPolicy.sizeWidgetVertical.restore();
        });
    });
});
