'use strict';

describe('Label', ()=>{
    let label = new ST.Widgets.Label(null, {text: 'test'});

    it('should set text from option if set', ()=>{
        expect(label.text).to.equal('test');
    });

    describe('#_textObj', ()=>{
        it('should have a null mask', ()=>{
            expect(label._textObj.mask).to.equal(null);
        });
    });

    describe('#_clipGraphic', ()=>{
        it('should be unrenderable', ()=>{
            expect(label._clipGraphic.renderable).to.equal(false);
        });
    });

    describe('#text', ()=>{
        it('should update _textObjs text', ()=>{
            label.text = 'update';
            expect(label._textObj.text).to.equal('update');
        });
    });
});
