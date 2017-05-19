'use strict';

describe('Settings', ()=>{
    it('should have a global instance', ()=>{
        expect(ST.settings).to.not.be.unidentified;
    });

    describe('#add()', ()=>{
        it('should add the given object as a property of itself', ()=>{
            let obj = {
                truck: {
                    size: 'big',
                    weight: 'heavy',
                },
            };

            ST.settings.add('vehicles', obj);

            expect(ST.settings.vehicles.truck.size).to.equal('big');
            expect(ST.settings.vehicles.truck.weight).to.equal('heavy');
        });
    });
});
