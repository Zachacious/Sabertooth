/*
This demonstrates one way to create an app with
SaberTooth by creating the app as a subclass of
ST.App( prototypal inheritance ) and then
instantiating it in index.html. For simple apps
you could just as well use a script tag in index.html
and just create instances of SaberTooth objects
without subclassing.

One could also install & use SaberTooth via npm.
(npm install sabertooth --save-dev)
 */

'use strict';

// SaberTooth should be loaded in index.html before this file.
// Themes should be loaded in index.html before this file.

// Create a subclass of ST.App
let DemoApp = function(theme) {
    // call parent constructor
    ST.App.call(this, {
        name: 'Demos',
        theme: theme, // must be loaded before this file
        autoResize: true,
    });

    // hack the sprite renderer to get a draw count since PIXI.js no longer
    // supports draw counts.
    ST.hackSpriteRendererDrawCounter(this.renderer.plugins.sprite);
    this.root.layout = new ST.Layouts.VBoxLayout(this.root);

    this.createDebugPanel();
    this.createSliderPanel();
};

// Inherit from ST.App
DemoApp.prototype = Object.create(ST.App.prototype);
// Set constructor back to DemoApp
DemoApp.prototype.constructor = DemoApp;

// METHODS ===========================================

// Begins the main application loop
DemoApp.prototype.begin = function() {
    let _this = this;

    this.main = function() {
        // reset the draw count for the next frame
        _this.renderer.plugins.sprite.draws = 0;

        _this.update(); // updates the app

        _this.dpDrawCountLabel.beginBypassUpdate(); // prevent a layout update
            _this.dpDrawCountLabel.text = _this.renderer.plugins.sprite.draws;
        _this.dpDrawCountLabel.endBypassUpdate();

        requestAnimationFrame(_this.main); // rinse, repeat
    };

    this.main();
};

// Creates a simple debug panel with draw counter.
// TODO: add fps
DemoApp.prototype.createDebugPanel = function() {
    // the panel itself with a vertical box layout
    this.debugPanel = new ST.Widgets.Panel(this.root, {
        width: 300,
        height: 150,
    });
    this.debugPanel.layout = new ST.Layouts.VBoxLayout(this.debugPanel);

    // creates a label at the top with the apps name
    this.dpTitle = new ST.Widgets.Label(this.debugPanel, {text: this.name});

    // creates a container with hbox layout below the title
    this.dpDrawCountSet
    = new ST.Widgets.Container(this.debugPanel, {height: 30});
    this.dpDrawCountSet.layout = new ST.Layouts.HBoxLayout(this.dpDrawCountSet);
    this.dpDrawCountSet.hPolicy
    = new ST.SizePolicies.ExpandingPolicy(this.dpDrawCountSet);

    // sets 'Draw Count: ' on the left side of this.dpDrawCountSet
    this.dpDrawCountTitle
        = new ST.Widgets.Label(this.dpDrawCountSet, {text: 'Draw Count: '});

    // set the draw count label to the right of 'Draw Count: '
    this.dpDrawCountLabel
        = new ST.Widgets.Label(this.dpDrawCountSet, {text: '0'});
};

DemoApp.prototype.createSliderPanel = function() {
    this.slPanel = new ST.Widgets.Panel(this.root, {
        width: 400,
        height: 100,
        x: 200,
        y: 200,
    });
    this.slPanel.layout = new ST.Layouts.VBoxLayout(this.slPanel);

    this.sl1 = new ST.Widgets.Slider(this.slPanel, {
        width: 300,
        height: 30,
    });
    this.sl1.hPolicy
        = new ST.SizePolicies.ExpandingPolicy(this.sl1);

    this.b1 = new ST.Widgets.TextButton(this.slPanel, {
        text: 'Button 1',
        width: 100,
        height: 30,
    });
};
