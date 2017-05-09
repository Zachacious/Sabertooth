'use strict';

describe('App', ()=>{
    let app = new ST.App();

    it('should create a pixi canvas on the page', ()=>{
        expect(document.body.contains(app.renderer.view)).to.be.true;
    });

    it('should have a valid theme', ()=>{
        expect(app.theme).to.be.an.instanceof(ST.Theme);
    });

    it('should have a valid root widget', ()=>{
        expect(app.root).to.be.an.instanceof(ST.BaseWidget);
    });

    it('should resize the root widget to match the window', ()=>{
        window.resizeBy(300, 200);
        expect(app.root.width).to.equal(window.innerWidth);
        expect(app.root.height).to.equal(window.innerHeight);
    });

    describe('#name', ()=>{
        it('should change the page title', ()=>{
            app.name = 'GoodApp!';
            expect(document.title).to.equal('GoodApp!');
        });
    });
});
