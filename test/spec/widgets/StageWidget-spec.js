'use strict';

describe('StageWidget', ()=>{
    it('Should have a bounds as big as the user defined size', ()=>{
        let sw = new ST.Widgets.StageWidget(null, {width: 600, height: 800});
        let b1 = new ST.Widgets.Button(sw, {width: 900, height: 900}); //eslint-disable-line
        let b2 = new ST.Widgets.Panel(sw, {width: 100, height: 100, x: 700}); // eslint-disable-line
        let bounds = sw.getBounds();

        expect(bounds.width).to.equal(600);
        expect(bounds.height).to.equal(800);
    });
});
