import { MyDisplay } from "../core/myDisplay";
import { MatterjsMgr } from "./matterjsMgr";
import { Visual } from "./visual";

// -----------------------------------------
//
// -----------------------------------------
export class Contents extends MyDisplay {

  private _matterjs:MatterjsMgr;

  constructor(opt:any) {
    super(opt)

    this._matterjs = new MatterjsMgr();

    new Visual({
      matterjs:this._matterjs,
      el:document.querySelector('.l-main')
    })
  }

  protected _update(): void {
    super._update();
  }
}