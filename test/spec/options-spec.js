'use strict';

describe('setOptions()', ()=>{
    it('should compare user set options object with'
        + ' default options and combine the values', ()=>{
            let defaults = {
                    name: 'blackhawk',
                    age: 28,
                    desc: 'crazy',
            };

            let user = {
                    age: 50,
                    desc: 'lazy',
            };

            user = UI.setOptions(user, defaults);

            expect(user.name).to.equal('blackhawk');
            expect(user.age).to.equal(50);
            expect(user.desc).to.equal('lazy');
        });
});
