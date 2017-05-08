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
let DemoApp = function() {
    // call parent constructor
    ST.App.call(this, {
        name: 'Demos',
        theme: greyToadTheme, // must be loaded before this file
    });

    // hack the sprite renderer to get a draw count since PIXI.js no longer
    // supports draw counts.
    ST.hackSpriteRendererDrawCounter(this.renderer.plugins.sprite);

    this.draws = 0; // stores the draw count
    this.createDebugPanel();
};

// Inherit from ST.App
DemoApp.prototype = Object.create(ST.App.prototype);
// Set constructor back to DemoApp
DemoApp.prototype.constructor = DemoApp;

// METHODS ===========================================

// Begins the main application loop
DemoApp.prototype.begin = function() {
    this.main = function() {
        this.draws = 0; // reset the draw count for the next frame
        this.update(); // updates the app
        this.dpDrawCountLabel.beginBypassUpdate(); // prevent a layout update
            this.dpDrawCountLabel.text = this.draws;
        this.dpDrawCountLabel.endBypassUpdate();

        requestAnimationFrame(this.main); // rinse, repeat
    };
};

// Creates a simple debug panel with draw counter.
// TODO: add fps
DemoApp.prototype.createDebugPanel = function() {
    // the panel itself with a vertical box layout
    this.debugPanel = new ST.Widgets.Panel(this.root, {
        width: 300,
        height: 150,
        layout: new ST.Layouts.VBoxLayout(this.debugPanel),
    });

    // creates a label at the top with the apps name
    this.dpTitle = new ST.Widgets.Label(this.debugPanel, {text: this.name});

    // creates a container with hbox below the title
    this.dpDrawCountSet = new ST.Widgets.Container(this.debugPanel, {
        layout: new ST.Layouts.HBoxLayout(this.dpDrawCountSet),
    });

    // sets 'Draw Count: ' on the left side of this.dpDrawCountSet
    this.dpDrawCountTitle
        = new ST.Widgets.Label(this.dpDrawCountSet, {text: 'Draw Count: '});

    // set the draw count label to the right of 'Draw Count: '
    this.dpDrawCountLabel
        = new ST.Widgets.Label(this.dpDrawCountSet, {text: '0'});
};
