'use strict';

// TODO: Would like to get more test here at some point

describe('Slider', ()=>{
    let sl = new ST.Widgets.Slider(null, {width: 200, height: 30});

    describe('#track', ()=>{
        it('should be an image widget', ()=>{
            expect(sl.track).to.be.an.instanceof(ST.Widgets.Image);
        });
    });

    describe('#trackHitRect', ()=>{
        it('should be a rectangle', ()=>{
            expect(sl.trackHitRect).to.be.an.instanceof(PIXI.Rectangle);
        });
    });

    describe('#button', ()=>{
        it('should be an image widget', ()=>{
            expect(sl.button).to.be.an.instanceof(ST.Widgets.Image);
        });
    });

    describe('#updateTrackHitRect()', ()=>{
        it('should set the size of the clickable area of the track', ()=>{
            expect(sl.trackHitRect.x).to.equal(0);
            expect(sl.trackHitRect.y).to.equal(-5);
            expect(sl.trackHitRect.width).to.equal(200);
            expect(sl.trackHitRect.height).to.equal(sl.height + 10);
        });
    });

    describe('#value', ()=>{
        it('should set the buttons pos when set', ()=>{
            sl.value = 0.5;
            const actual = 90;
            expect(sl.button.x).to.equal(actual);
        });

        it('should return the value from the position', ()=>{
            const actual = 0.5;
            expect(sl.value).to.equal(actual);
        });
    });

    describe('#orientation', ()=>{
        sl.orientation = ST.HORIZONTAL;

        it('should set the min and max heights when set', ()=>{
            expect(sl.min.height).to.equal(sl.button.height);
            expect(sl.min.width).to.equal(30);
            expect(sl.max.height).to.equal(10000);
            expect(sl.max.width).to.equal(sl.min.width);
        });

        it('should set the track size', ()=>{
            expect(sl.track.width).to.equal(5);
            expect(sl.track.height).to.equal(sl.height);
        });

        it('should set alignments', ()=>{
            expect(sl.layout.alingment.hAlign).to.equal(ST.Alignment.center);
            expect(sl.layout.alingment.vAlign).to.equal(ST.Alignment.top);
        });

        it('should set the tracks size policies', ()=>{
            expect(sl.track.vPolicy).to.be.an
                .instanceof(ST.SizePolicies.ExpandingPolicy);

            expect(sl.track.hPolicy).to.be.an
                .instanceof(ST.SizePolicies.FixedPolicy);
        });
    });
});
