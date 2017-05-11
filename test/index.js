'use strict';

describe('ST', ()=>{
    it('should exist as a global object', ()=>{
        expect(ST).to.be.an('object');
    });
    require('./spec');
});
