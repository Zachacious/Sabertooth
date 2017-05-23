# Sabertooth

### A hardware accelerated user interface framework for JavaScript.
Sabertooth is inspired by [QT](https://www.qt.io/), uses super-fast [PIXI.js](https://github.com/pixijs/pixi.js) under-the-hood and renders in webGL with canvas fallback. Widgets are extensions of PIXI.Container and have most of those properties, such as tint, alpha, blending modes and filters(shaders). Custom widgets and custom styling are easily accomplished by sub-classing existing widgets and modifying or creating new style sheets.

This project aims to be a full-fledged user interface framework for games, editors and other creative projects. A limited set of widgets and layouts are implemented and it may undergo some big changes before the first major release. See examples and stay up-to-date on what classes are available by viewing the docs and following [@Zachacious](https://twitter.com/Zachacious) on twitter.

* [Roadmap](ROADMAP.md)
* [Contributing Guidelines](CONTRIBUTING.md)
* [Documentation](https://abydosdigital.github.io/Sabertooth/)

[![Build Status](https://travis-ci.org/AbydosDigital/Sabertooth.svg?branch=master)](https://travis-ci.org/AbydosDigital/Sabertooth)
[![Inline docs](http://inch-ci.org/github/AbydosDigital/SaberTooth.svg?branch=master)](http://inch-ci.org/github/AbydosDigital/SaberTooth)
***
<!-- ### Goal
Imagine designing a complex user interface within a designer app and exporting it to your game/app with only a few lines of code to get it up and running. That's the goal, but this is a long-term project and only your support will get us there. Please consider sending a pull request or make a donation via PATREON. -->

### Get Started

#### The easiest way to get started with Sabertooth is to [download](https://github.com/AbydosDigital/Sabertooth/releases) the latest release.
<!-- * [Sabertooth.js](https://github.com/AbydosDigital/Sabertooth/releases/download/v0.1.9-alpha/sabertooth.js)
* [Sabertooth.min.js](https://github.com/AbydosDigital/Sabertooth/releases/download/v0.1.9-alpha/sabertooth.min.js) -->

**Example:**
```html
<script src="Sabertooth.min.js"></script>
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
    let main = function () {
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
**Example:**
```javascript
import * as ST from 'sabertooth'; // for es6 modules

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
let main = function () {
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

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

### Versioning
We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/AbydosDigital/SaberTooth/tags).

### Authors
* **Zach Moore** *- initial work -* [@Zachacious](https://github.com/Zachacious)

See also the list of [contributors](https://github.com/AbydosDigital/Sabertooth/graphs/contributors) who participated in this project.

### License
This project is licensed under the **ISC** license. See [LICENSE.md](LICENSE) for more details.

### Acknowledgements
Special thanks to:
* [GoodBoyDigital](http://www.goodboydigital.com/) - [Pixi.js](http://www.pixijs.com/)
* [Primus](https://github.com/primus) - [EventEmitter3](https://github.com/primus/eventemitter3)

### Questions?

Please contact AbydosDigital@gmail.com with any further questions.
