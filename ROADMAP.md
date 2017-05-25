# Sabertooth  Project Roadmap
 This is meant to be a rough outline of where we're at and the journey ahead. Feel free to add your own ideas or updates:smile:

 Follow [@Zachacious](https://twitter.com/Zachacious) on twitter to stay up-to-date on the latest.

~ *All of the below is subject to change because of natural project evolution and depending on who's willing to work on what and when* ~

**v0.3.0**
* Make UI's skinnable
* Bitmap labels

**v0.4.0**
* Keyboard input system
* Scrollable viewports

**v0.5.0**
* List View
* Tree View

**v0.6.0**
* Progress bar
* Spring
* Divider
* Checkbox
* RadioButton

**v0.7.0**
* TabView
* Toolbars

**v0.8.0**
* Menus

**v0.9.0**
* Text input

**v1.0.0:**
* Simplify api names -- ST.Widgets.Button = ST.Button

**v1.1.0**
* TitleBar
* Windows

**v1.2.0**
* Undo

**v1.3.0**
* Actions

**v1.4.0**
* Full working demos for mobile(Cocoonjs), web, and desktop(Electron)

**v2.0.0**
* Animations
* Designer App

---
### Full list of features

:white_circle: = Not implemented |
:white_check_mark: = Already implimented

* App:white_check_mark: - Handles creating the PIXI renderer, the root widget and automatic resizing
* Theme:white_check_mark: - Creates themes from style sheets stored in js files
* Skin::white_circle: - Use images and bitmap fonts instead of 'Flat Style' rectangles for theme.
* Layouts
    * BaseLayout:white_check_mark:
    * FixedLayout:white_check_mark: - Arrange widgets via user defined positions
    * BoxLayout:white_check_mark: - Stack widgets vertically or horizontal
    * GridLayout:white_circle: - Arrange widgets in a grid
* Size Policies
    * BasePolicy:white_check_mark:
    * FixedPolicy:white_check_mark: - Use user defined width or height
    * ExpandingPolicy:white_check_mark: - Fill the parent widget
    * SharedExpandingPolicy:white_check_mark: - Share space with siblings - fill the parent
    * CompressPolicy:white_circle: - Shrink to fit children contained within
* Widgets
    * BaseWidget:white_check_mark:
    * Label:white_check_mark: - Show text
    * BitmapLabel:white_circle: - Show text using a bitmap font
    * Button:white_check_mark:
    * TextButton:white_check_mark: - Button with text
    * Image:white_check_mark: - Sprite Texture with widget properties
    * Panel:white_check_mark: - Container with solid background
    * Slider:white_check_mark: - Track with a button that slides to change values
    * Container:white_check_mark: - Non-renderable container of widgets
    * StageWidget( root widget ):white_check_mark: - Counts its own size with getBounds() - use as root widget
    * ProgressBar:white_circle: - Bar that fills over time
    * ScrollView:white_circle: - Content that moves with scrollbars
    * ListView:white_circle:
    * TreeView:white_circle:
    * Spring:white_circle: - Use to compress widgets in certain layouts
    * Divider:white_circle: - Simple bar use to divide space
    * TabView:white_circle:
    * Splitter:white_circle: - Adjustable bar that splits content areas
    * Window:white_circle: - Free moving windows
    * TitleBar( for windows ):white_circle:
    * Menu:white_circle: - Traditional and responsive menus of all kinds
    * Toolbar:white_circle:
    * ToolButton:white_circle:
    * MenuButton:white_circle:
    * Checkbox:white_circle:
    * RadioButton:white_circle:
    * TextInput:white_circle:
    * MultiLineTextInput:white_circle:
* Alignments( for layouts ):white_check_mark: - Provides an offset for layout positioning
* Settings:white_check_mark: - Configurable global settings for Sabertooth classes to use
* Padding( for widgets ):white_check_mark:
* Actions( QT style ):white_circle: -  See [QT Actions](http://doc.qt.io/qt-5/qaction.html)
* Undo:white_circle: - See [QT Undo](http://doc.qt.io/qt-4.8/qundo.html)
* MVC:white_circle: - Use 'Item?' sub-classes interchangeably with different views
* Keyboard Input:white_circle:
* Designer App:white_circle: - Design and create widget layouts visually
* Demo Project(s):white_circle: - To test desktop and mobile fully
* Animations:white_circle: - For transitions
