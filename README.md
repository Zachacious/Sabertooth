# Sabertooth

### A hardware accelerated user interface framework for JavaScript.
Sabertooth is inspired by QT, uses [PIXI.js](https://github.com/pixijs/pixi.js) under-the-hood and renders in webGL with canvas fallback.

>**WARNING:** This project is in alpha and may experience breaking changes from one version to the next until all the core features are implimented and the first major version is released.

* [Contributing Guidelines](../master/CONTRIBUTING.md)
* [Documentation](https://abydosdigital.github.io/Sabertooth/)

[![Build Status](https://travis-ci.org/AbydosDigital/SaberTooth.svg?branch=master)](https://travis-ci.org/AbydosDigital/SaberTooth)
[![Inline docs](http://inch-ci.org/github/AbydosDigital/SaberTooth.svg?branch=master)](http://inch-ci.org/github/AbydosDigital/SaberTooth)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
***

### Why?

This project was designed for those wanting a hardware accelerated alternative to DOM based user interface frameworks. Widgets have alpha, tint, blending modes, filters(shaders), and they can be animated. Custom widgets and custom styling are easily accomplished by sub-classing existing widgets and modifying or creating new style sheets. No knowledge of webGL required.

### Features

**Current:**
* App - Handles creating PIXI.js canvas and root widget.
* Size Policies:
    * Fixed - Sets user defined size
    * Expanding - Expands into the parent(more efficient for some situations).
    * Shared Expanding - Expands into parent but shares space with siblings.
* Layouts:
    * Fixed - Sets user defined position
    * VBox - Stacks widgets vertically on top of each other
    * HBox - Places widgets inline side by side
* Alignments for layouts:
    * Horizontal: left, center, right
    * Vertical: top, middle, bottom
* Widgets:
    * Panel
    * Label
    * Button
    * TextButton
    * Slider
    * Stage widget (root widget)
    * Container
    * Image
* Padding for widgets
* Themes created from styles sheets

**Coming soon:**
* Scrollable view
* Drag n' drop
* QT style actions
* Menus
* Keyboard shortcuts for actions
* Undo ( with commands the way QT does it)
* Text Edit
* Check box
* List
* Trees
* MVC
* Tabs
* Dialog
* Progress bar
* ...

### Get Started

#### The easiest way to get started with Sabertooth is to download the builds directly.
* [Sabertooth.js](../master/dist/sabertooth.js)
* [Sabertooth.min.js](../master/dist/sabertooth.min.js)

**To use:**
```html
<script src="Sabertooth.js"></script>
<script>
    let app = new ST.App(/*options*/);

    let tb = new ST.Widgets.TextButton(app.root, {
        text: 'My Button',
        x: 100,
        y: 100,
        width: 200,
        height: 30,
    });

    // Set a click callback
    tb.on('click', ()=>{
        console.log('My Button Was Clicked!');
    });

    //main loop
    let main = ()=>{
        app.update(); // Update UI logic
        requestAnimationFrame(main); // Loop
    }

    main(); // Begin the main application loop
</script>
```

#### Install with npm:
```
 $> npm install Sabertooth
```
**To use:**
```javascript
import * as ST from 'Sabertooth'; // for es6 modules

let app = new ST.App(/*options*/);

let tb = new ST.Widgets.TextButton(app.root, {
    text: 'My Button',
    x: 100,
    y: 100,
    width: 200,
    height: 30,
});

// Set a click callback
tb.on('click', ()=>{
    console.log('My Button Was Clicked!');
});

//main loop
let main = ()=>{
    app.update(); // Update UI logic
    requestAnimationFrame(main); // Loop
}

main(); // Begin the main application loop
```

#### Test
```
gulp test
```

#### To build locally:
* Fork Sabertooth
* Clone
* CD to the project directory
* Install dependencies:
```
npm install
```
Build:
```
gulp
```

### Contributing

Please read [CONTRIBUTING.md](../master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

### Versioning
We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/AbydosDigital/SaberTooth/tags).

### Authors
* **Zach Moore** *- initial work -* [@Zachacious](https://github.com/Zachacious)

See also the list of [contributors](https://github.com/AbydosDigital/Sabertooth/graphs/contributors) who participated in this project.

### License
This project is licensed under the **ISC** license. See [LICENSE.md](../master/LICENSE.md) for more details.

### Acknowledgements
Special thanks to:
* [GoodBoyDigital](http://www.goodboydigital.com/) - [Pixi.js](http://www.pixijs.com/)
* [Primus](https://github.com/primus) - [EventEmitter3](https://github.com/primus/eventemitter3)

### Questions?

Please contact AbydosDigital@gmail.com with any further questions you may have.
