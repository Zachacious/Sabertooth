'use strict';

describe('BoxLayout', ()=>{
    let w0 = new UI.Widgets.Panel(null, {width: 400, height: 400});
    w0.layout = new UI.Layouts.BoxLayout(w0, UI.VERTICAL);
    let w1 = new UI.Widgets.Button(w0, {width: 20, height: 20});
    let w2 = new UI.Widgets.Button(w0, {width: 20, height: 20});
    let w3 = new UI.Widgets.Button(w0, {width: 20, height: 20});

    describe('#initTotalChildrenSize()', ()=>{
        it('should calculate the total size of the children', ()=>{
            expect(w0.layout._totalChildrenWidth).to.equal(0);
            expect(w0.layout._totalChildrenHeight).to.equal(0);

            w0.layout.initTotalChildrenSize();

            // add together + spacing
            expect(w0.layout._totalChildrenWidth).to.equal(72);
            expect(w0.layout._totalChildrenHeight).to.equal(72);
        });
    });

    describe('#beginIteration()', ()=>{
        it('should prepare variables before iteration', ()=>{
            let wLayout = w0.layout;
            wLayout.beginIteration();

            expect(wLayout._totalChildrenHeight).to.equal(0);
            expect(wLayout._totalChildrenWidth).to.equal(0);

            expect(wLayout.posOffset.x).to.equal(0);
            expect(wLayout.posOffset.y).to.equal(0);
        });
    });

    describe('#setChildPos()', ()=>{
        it('should set the position of the child', ()=>{
            let wLayout = w0.layout;
            wLayout.setChildPos(w1);

            expect(wLayout._totalChildrenWidth).to.equal(24);
            expect(wLayout._totalChildrenHeight).to.equal(24);

            expect(w1.transform.position.x).to.equal(4);
            expect(w1.transform.position.y).to.equal(4);
        });
    });
});
