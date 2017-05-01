'use strict';
// require('.././dist/UI.js');

describe('UI', ()=>{
    it('should exist as a global object', ()=>{
        expect(UI).to.be.an('object');
    });
    require('./spec');
});
