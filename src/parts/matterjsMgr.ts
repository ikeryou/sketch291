
import { Bodies, Body, Composite, Engine, Render, Runner, Composites, Constraint } from "matter-js";
import { Conf } from "../core/conf";
import { Func } from "../core/func";
import { Util } from "../libs/util";
import { MyObject3D } from "../webgl/myObject3D";

export class MatterjsMgr extends MyObject3D {

  public engine:Engine;
  public render:Render;

  private _runner:Runner;

  public lineBodies:Array<Array<Body>> = [];

  public itemBodies:Array<{size:number, body:Body}> = []; // マウス用

  constructor() {
    super()

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    // エンジン
    this.engine = Engine.create();
    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0;

    // レンダラー
    this.render = Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: sw,
        height: sh,
        showAngleIndicator: false,
        showCollisions: false,
        showVelocity: false,
        pixelRatio:Conf.instance.FLG_SHOW_MATTERJS ? 1 : 0.1
      }
    });
    this.render.canvas.classList.add('l-matter');

    if(!Conf.instance.FLG_SHOW_MATTERJS) {
      this.render.canvas.classList.add('-hide');
    }

    const stackNum = 10;
    for(let i = 0; i < stackNum; i++) {
      this._makeLine((sh / stackNum) * i, 150);
    }

    for(let i = 0; i < Conf.instance.TEXT_NUM; i++) {
      const mouseSize = Math.max(sw, sh) * Util.instance.random(0.05, 0.1);
      const item:Body = Bodies.rectangle(0, 0, sw * 0.2, mouseSize * 1, {isStatic:true, friction:0.2, restitution:0.195, render:{visible: Conf.instance.FLG_SHOW_MATTERJS}});
      Composite.add(this.engine.world, [
        item,
      ]);
      // Body.setAngle(item, Util.instance.radian(45));
      Body.setPosition(item, {x:9999, y:9999});
      this.itemBodies.push({
        size:mouseSize,
        body:item,
      });
    }

    this._runner = Runner.create();
    this.start();
    this._resize();
  }


  private _makeLine(baseY:number, num:number): void {
    const sw = Func.instance.sw();
    // const sh = Func.instance.sh();

    const stiffness = 1;
    const bridgeNum = num;
    const bridgeSize = (sw / bridgeNum) * 0.25;

    const bridge = Composites.stack(0, 0, bridgeNum, 1, 0, 0, (x:number, y:number) => {
      return Bodies.circle(x, y, bridgeSize, {
        // collisionFilter: { group: Body.nextGroup(false) },
        // density: 0.05,
        // friction: 0.9,
        // restitution:0.01,
        render: {
          fillStyle: '#060a19',
          visible: Conf.instance.FLG_SHOW_MATTERJS
        }
      });
    });

    Composites.chain(bridge, 0, 0, 0, 0, {
      stiffness: stiffness,
      render: {
        visible: Conf.instance.FLG_SHOW_MATTERJS
      }
    });

    Composite.add(this.engine.world, [
      bridge,
      Constraint.create({
          pointA: { x: 0, y: baseY },
          bodyB: bridge.bodies[0],
          pointB: { x: 0, y: 0 },
          length: 1,
          stiffness: stiffness,
      }),
      Constraint.create({
          pointA: { x: sw, y: baseY },
          bodyB: bridge.bodies[bridge.bodies.length - 1],
          pointB: { x: 0, y: 0 },
          length: 1,
          stiffness: stiffness
      })
    ]);

    // Bodyだけ入れておく
    this.lineBodies.push([]);
    const lineKey = this.lineBodies.length - 1;
    bridge.bodies.forEach((b,i) => {
      Body.setPosition(b, {x:(sw / bridgeNum) * i, y:baseY});
      this.lineBodies[lineKey].push(b);
    })
  }


  public start(): void {
    Render.run(this.render);
    Runner.run(this._runner, this.engine);
  }


  public stop(): void {
    Render.stop(this.render);
    Runner.stop(this._runner);
  }




  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update();
  }


  protected _resize(): void {
    super._resize();

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    this.render.canvas.width = sw;
    this.render.canvas.height = sh;
  }
}