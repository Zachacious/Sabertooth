/*
 *  options.js
 */

/**
 * Combines user options and defaults
 * @memberof UI
 * @param  {Object}   user     parameters provided by user
 * @param  {Object}   defaults parameters provided by class
 * @return {Object} - return combined options
 */
 let setOptions = function(user, defaults) {
     user = user || defaults;

     for (let opt in defaults)
         if (defaults.hasOwnProperty(opt) && !user.hasOwnProperty(opt))
             user[opt] = defaults[opt];

    return user;
 };

 export {setOptions};
