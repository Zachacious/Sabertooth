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
        expect(app.root).to.be.an.instanceof(ST.Widgets.BaseWidget);
    });

    it('should resize the root widget to match the window', ()=>{
        window.resizeBy(300, 200);
        expect(app.root.width).to.equal(window.innerWidth);
        expect(app.root.height).to.equal(window.innerHeight);
    });

    describe('#name', ()=>{
        it('should change the page title', ()=>{
            app.name = 'SaberTooth Test';
            expect(document.title).to.equal('SaberTooth Test');
        });
    });

    describe('#autoResize', ()=>{
        it('should add a listener to resize event if set to true and ' +
            'one doesnt already exist', ()=>{
                app.autoResize = true;
                let listeners = app.listeners('resize');
                expect(listeners.indexOf(app.resizeToWindow)).to.not.equal(-1);
            });

        it('should not add more than one listener', ()=>{
            app.autoResize = true;
            let listeners = app.listeners('resize');
            expect(listeners.length).to.equal(1);
        });

        it('should remove the listener from resize if set to false', ()=>{
            app.autoResize = false;
            let listeners = app.listeners('resize');
            expect(listeners.indexOf(app.resizeToWindow)).to.equal(-1);
        });
    });
});
