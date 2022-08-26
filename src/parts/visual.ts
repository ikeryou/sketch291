import { Body } from "matter-js";
import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Update } from '../libs/update';
import { MatterjsMgr } from './matterjsMgr';
import { Mesh } from 'three/src/objects/Mesh';
import { Vector3 } from 'three/src/math/Vector3';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Scroller } from "../core/scroller";
import { Tween } from "../core/tween";
import { Point } from "../libs/point";
import { Conf } from "../core/conf";
// import { PointLight } from "three";
import { Util } from "../libs/util";
import { Param } from "../core/param";

export class Visual extends Canvas {

  private _con:Object3D;
  private _matterjs:MatterjsMgr;

  private _item:Array<Array<Object3D>> = [];
  private _txt:Array<{el:HTMLElement, pos:Point}> = [];

  constructor(opt: any) {
    super(opt);

    console.log(Param.instance.debug)
    this._matterjs = opt.matterjs;

    this._con = new Object3D();
    this.mainScene.add(this._con);

    // const light = new PointLight(0xffffff, 1);
    // this.mainScene.add(light)
    // light.position.x = Func.instance.sw() * 0;
    // light.position.y = Func.instance.sh() * 0;
    // light.position.z = Func.instance.sh() * 1;

    // 障害物
    const geo = new BoxGeometry(1,1,1);
    const mat = new MeshBasicMaterial({
      color: 0xffffff,
      // emissive:0x333333,
      // transparent:true,
      depthTest:false,
    })

    this._matterjs.lineBodies.forEach((bodies,i) => {
      this._item.push([])
      bodies.forEach(() => {
        const c = new Object3D();
        this._con.add(c);

        const mesh = new Mesh(geo, mat)
        c.add(mesh);
        mesh.position.set(0, 0.5, 0.5);

        this._item[i].push(c);
      })
    })

    // テキスト作る
    setTimeout(() => {
      const sw = Func.instance.sw();
      let y = Func.instance.sh() * 1.5;
      for(let i = 0; i < Conf.instance.TEXT_NUM; i++) {
        const t = document.createElement('div');
        t.innerHTML = 'SCROLL'
        t.classList.add('item');
        document.querySelector('.l-text')?.append(t);

        const txtW = this.getWidth(t)
        const x = Util.instance.random(txtW * 0.5, sw - txtW * 0.5);
        this._txt.push({
          el:t,
          pos:new Point(x, y)
        });

        y += Func.instance.sh() * 1.25;
      }

      Tween.instance.set(document.querySelector('.l-height'), {
        height:y + Func.instance.sh() * 0.5
      })
    }, 1000)

    Scroller.instance.set(0);
    this._resize()
  }


  protected _update(): void {
    super._update()

    // this._con.position.y = Func.instance.screenOffsetY() * -1;

    const sw = Func.instance.sw()
    const sh = Func.instance.sh()

    const scroll = Scroller.instance.val.y;

    this._txt.forEach((val,i) => {
      const txtSize = this.getRect(val.el);
      let txtX = val.pos.x;
      let txtY = val.pos.y - scroll;

      const itemBody = this._matterjs.itemBodies[i];

      Tween.instance.set(val.el, {
        x:txtX - txtSize.width * 0.5,
        y:txtY - txtSize.height * 0.5,
        fontSize: itemBody.size * 1.2,
      })

      if(itemBody != undefined) Body.setPosition(itemBody.body, {x:txtX, y:txtY})
    })

    const bodies = this._matterjs.lineBodies;
    const bridgeSize = (sw / bodies[0].length) * 0.5;
    bodies.forEach((body, bId) => {
      const bodyNum = body.length;
      body.forEach((val,i) => {
        let bodyX = val.position.x - sw * 0.5
        let bodyY = val.position.y * -1 + sh * 0.5

        const offsetX = bridgeSize;

        const mesh = this._item[bId][i];
        const to = new Vector3((sw / bodyNum) * i - sw * 0.5 + bridgeSize + offsetX, (sh / bodies.length) * -bId + sh * 0.5, 0);

        const top = sw * 0.05;
        const from = new Vector3(bodyX + offsetX, bodyY, -top);

        mesh.position.copy(to)
        mesh.lookAt(from)

        const size = 1;
        mesh.scale.set(size, size, to.distanceTo(from) * 0.5);
      })
    })


    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(0x00000, 0)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
