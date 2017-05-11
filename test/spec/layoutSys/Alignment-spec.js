'use strict';

describe('Alignment', ()=>{
    let widget0 = new ST.Widgets.BaseWidget();
    widget0.width = 400; widget0.height = 400;
    let widget1 = new ST.Widgets.BaseWidget(widget0);
    widget1.width = 200; widget1.height = 200;

    describe('#getOffset()', ()=>{
        it('should return a relative offset base on the given horizontal'
            + ' and vertical alignment', ()=>{
                widget0.layout.alignment.hAlign = ST.Alignment.center;
                widget0.layout.alignment.vAlign = ST.Alignment.middle;
                let off = new ST.Point();
                off = widget0.layout.alignment.getOffset(widget0,
                    widget1.width, widget1.height);
                // (widget0.width/2) - (widget1.width/2)
                expect(off.x).to.equal(100);
                expect(off.y).to.equal(100);
            });
    });

    describe('#left', ()=>{
        it('should return relative position for left alignment', ()=>{
            let off = ST.Alignment.left(400, widget0);
            expect(off).to.equal(4);
        });
    });

    describe('#center', ()=>{
        it('should return relative position for center alignment', ()=>{
            let off = ST.Alignment.center(100, widget0);
            expect(off).to.equal(150);
        });
    });

    describe('#right', ()=>{
        it('should return relative position for right alignment', ()=>{
            let off = ST.Alignment.right(100, widget0);
            expect(off).to.equal(300);
        });
    });

    describe('#top', ()=>{
        it('should return relative position for top alignment', ()=>{
            let off = ST.Alignment.top(100, widget0);
            expect(off).to.equal(4);
        });
    });

    describe('#middle', ()=>{
        it('should return relative position for middle alignment', ()=>{
            let off = ST.Alignment.middle(100, widget0);
            expect(off).to.equal(150);
        });
    });

    describe('#bottom', ()=>{
        it('should return relative position for bottom alignment', ()=>{
            let off = ST.Alignment.bottom(100, widget0);
            expect(off).to.equal(300);
        });
    });
});
