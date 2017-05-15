# Sabertooth

### A hardware accelerated user interface framework for JavaScript.
Sabertooth is inspired by QT, uses [PIXI.js](https://github.com/pixijs/pixi.js) under-the-hood and renders in webGL with canvas fallback.

* [Contributing Guidelines](../blob/master/CONTRIBUTING)
* [Documentation](https://abydosdigital.github.io/Sabertooth/)

[![Build Status](https://travis-ci.org/AbydosDigital/SaberTooth.svg?branch=master)](https://travis-ci.org/AbydosDigital/SaberTooth)
[![Inline docs](http://inch-ci.org/github/AbydosDigital/SaberTooth.svg?branch=master)](http://inch-ci.org/github/AbydosDigital/SaberTooth)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
***

### Why?

This project was designed for those wanting a hardware accelerated alternative to dom based user interface frameworks. Custom widgets and custom styling are easily accomplished by sub-classing existing widgets and modifying or creating new style sheets.

> Apps can have transparent backgrounds allowing you to overlay your UI on top of say a three.js scene. Widgets are really just elaborated sprites. They have alpha, tint and can be animated.

### Features

###### Current:
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

###### Coming soon:
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
* ...

### Get Started

###### The easiest way to get started with Sabertooth is to download the builds directly.
* [Sabertooth.js](../blob/master/dist/Sabertooth.js)
* [Sabertooth.min.js](../blob/master/dist/Sabertooth.min.js)

###### Install with npm:
```
 $> npm install Sabertooth
```
To use:
```
import * as ST from 'Sabertooth';
```
