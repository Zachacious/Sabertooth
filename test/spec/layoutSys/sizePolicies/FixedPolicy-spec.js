'use strict';

describe('FixedPolicy', ()=>{
    let widget = new ST.Widgets.Button();

    describe('#sizeWidgetHorizontal', ()=>{
        it('should validate the width of the widget', ()=>{
            let spy = sinon.spy(widget, 'validateWidth');
            widget.hPolicy.sizeWidgetHorizontal();
            expect(spy.called).to.be.true;
            widget.validateWidth.restore();
        });
    });

    describe('#sizeWidgetVertical', ()=>{
        it('should validate the height of the widget', ()=>{
            let spy = sinon.spy(widget, 'validateHeight');
            widget.vPolicy.sizeWidgetVertical();
            expect(spy.called).to.be.true;
            widget.validateHeight.restore();
        });
    });
});
