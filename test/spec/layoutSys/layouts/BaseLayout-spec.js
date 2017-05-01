'use strict';

describe('BaseLayout', ()=>{
    let widget0 = new UI.Widgets.Panel(null, {width: 100, height: 100});
    let widget1 = new UI.Widgets.Button(widget0, {width: 20, height: 20});
    widget1.position.set(20, 20);

    describe('#exec', ()=>{
        it('should set the position of its children and exec their layours',
        ()=>{
            // real position isnt set until layout executes
            expect(widget1.transform.position.x).to.equal(0);
            expect(widget1.transform.position.y).to.equal(0);

            let spy = sinon.spy(widget1.layout, 'exec');

            widget0.layout.exec();

            expect(spy.called).to.be.true;

            widget1.layout.exec.restore();

            expect(widget1.transform.position.x).to.equal(24);
            expect(widget1.transform.position.y).to.equal(24);
        });
    });
});
