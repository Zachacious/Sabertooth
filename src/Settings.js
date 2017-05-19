/**
 * Stores settings and default values used by the app and widgets.
 * Exports a settings object that adds the settings to itself?
 * Access like: ST.setting.slider.button.height
 * @memberof ST
 * @static
 */
 class Settings {
    /**
     *
     */
    constructor() {}

    /**
     * Adds settings to the global object;
     * @param {String} name Name of the settings
     * @param {Object} settings Settings to Adds
     */
     add(name, settings) {
        if(!name || !settings) {
            return;
        }

        this[name] = settings;
    }
}

let settings = new Settings();
export {settings};
