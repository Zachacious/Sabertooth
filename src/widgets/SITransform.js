/*
    siTransform.js
 */

import * as PIXI from 'pixi.js';

/**
 * Transform that makes a PIXI.Container size independent
 * from its parent
 * @memberof UI.Widgets
 */
export default class SITransform extends PIXI.TransformStatic {
    /**
     *
     */
    constructor() {
        super();
    }

    /**
     * @inheritDoc
     */
    updateTransform(parentTransform) {
        const lt = this.localTransform;
       if (this._localID !== this._currentLocalID) {
           // get the matrix values of the displayobject
           //  based on its transform properties..
           lt.a = this._cx * this.scale._x;
           lt.b = this._sx * this.scale._x;
           lt.c = this._cy * this.scale._y;
           lt.d = this._sy * this.scale._y;
           lt.tx = this.position._x - ((this.pivot._x * lt.a) +
           (this.pivot._y * lt.c));
           lt.ty = this.position._y - ((this.pivot._x * lt.b) +
           (this.pivot._y * lt.d));
           this._currentLocalID = this._localID;
           // force an update..
           this._parentID = -1;
       }
       if (this._parentID !== parentTransform._worldID) {
           // concat the parent matrix with the objects transform.
           const pt = parentTransform.worldTransform;
           const wt = this.worldTransform;
        //    wt.a = (lt.a * pt.a) + (lt.b * pt.c);
        //    wt.b = (lt.a * pt.b) + (lt.b * pt.d);
        //    wt.c = (lt.c * pt.a) + (lt.d * pt.c);
        //    wt.d = (lt.c * pt.b) + (lt.d * pt.d);
           wt.tx = (lt.tx * pt.a) + (lt.ty * pt.c) + pt.tx;
           wt.ty = (lt.tx * pt.b) + (lt.ty * pt.d) + pt.ty;
           this._parentID = parentTransform._worldID;
           // update the id of the transform..
           this._worldID ++;
       }
    }
}
