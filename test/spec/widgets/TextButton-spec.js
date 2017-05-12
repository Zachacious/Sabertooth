'use strict';

describe('TextButton', ()=>{
    describe('#Text', ()=>{
        it('should set the text for the contained label', ()=>{
            let tb = new ST.Widgets.TextButton();
            tb.text = 'meow';
            expect(tb.label.text).to.equal('meow');
        });
    });
});
