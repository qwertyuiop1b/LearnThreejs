import React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";
import { SelectionHelper } from "three/examples/jsm/interactive/SelectionHelper";

class App extends React.Component {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.OrthographicCamera | null;
  cvsRef: React.RefObject<HTMLCanvasElement>;

  selectionScene: THREE.Scene;
  renderTarget: THREE.WebGLRenderTarget | null;
  selectionCamera: THREE.OrthographicCamera | null;

  selectionBox: THREE.Vector4;
  startPoint: THREE.Vector2;
  active: boolean;
  controls: OrbitControls | null;

  selectionTexture: THREE.Texture | null;
  points: THREE.Points | null;
  pointsGrop: THREE.Group;
  pointsModelViewMatrix: THREE.Matrix4;

  constructor(props: any) {
    super(props);
    this.scene = new THREE.Scene();
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this.cvsRef = React.createRef();
    this.points = null;
    this.selectionBox = new THREE.Vector4();
    this.selectionScene = new THREE.Scene();
    this.renderTarget = null;
    this.selectionCamera = null;
    this.startPoint = new THREE.Vector2();
    this.active = false;
    this.selectionTexture = null;
    this.pointsGrop = new THREE.Group();
    this.pointsModelViewMatrix = new THREE.Matrix4();

    this.state = {};
  }

  handleResizeWindow = () => {
    this.cvsRef.current!.width = window.innerWidth;
    this.cvsRef.current!.height = window.innerHeight;
    this.renderer?.setSize(window.innerWidth, window.innerHeight);
    this.camera?.updateMatrix();
  };

  handlePCDData = () => {
    const loader = new PCDLoader();
    loader.load("/000053.pcd", (p) => {
      this.points = p as THREE.Points<
        THREE.BufferGeometry,
        THREE.PointsMaterial
      >;

      const length = this.points.geometry.attributes.position.array.length;
      const indexArray = new Int32Array(length / 3);
      indexArray.forEach((val, index) => {
        indexArray[index] = index;
      });

      this.points.geometry.setAttribute(
        "index",
        new THREE.BufferAttribute(indexArray, 1)
      );

      const materialUniforms = {};
      this.scene.add(this.points);
    });
  };

  handleMouseDown = (evt: MouseEvent) => {
    console.log("down...");
    this.mouseStartPoint.x = this.mouse.x =
      (evt.clientX / window.innerWidth) * 2 - 1;
    this.mouseStartPoint.y = this.mouse.y =
      (-evt.clientY / window.innerHeight) * 2 + 1;

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  };

  handleMouseMove = (evt: MouseEvent) => {
    console.log("moving...");
    this.mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = (-evt.clientY / window.innerHeight) * 2 + 1;

    const intersects = this.raycaster?.intersectObjects([this.points!]);
    console.log(intersects);
    intersects?.forEach((item: any) => {
      // @ts-ignore
      (item.object as THREE.Points).geometry.attributes.color.array[
        item.index * 3
      ] = 1;
      // @ts-ignore
      (item.object as THREE.Points).geometry.attributes.color.array[
        item.index * 3 + 1
      ] = 0;
      // @ts-ignore
      (item.object as THREE.Points).geometry.attributes.color.array[
        item.index * 3 + 2
      ] = 0;
    });
    this.points!.geometry.attributes.color.needsUpdate = true;
  };

  handleMouseUp = (evt: MouseEvent) => {
    this.mouseEndPoint.x = (evt.clientX / window.innerWidth) * 2 - 1;
    this.mouseEndPoint.y = (-evt.clientY / window.innerHeight) * 2 + 1;
    const deltaVector = this.mouseEndPoint.sub(this.mouseStartPoint);
    console.log(deltaVector);

    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
  };

  init() {}

  componentDidMount(): void {
    const cvs = this.cvsRef.current!;
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    this.camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 1, 100);
    this.camera.position.set(0, 0, 50);

    const helper = new THREE.AxesHelper(12);
    this.scene.add(helper);

    this.controls = new OrbitControls(this.camera, cvs);
    this.controls.dampingFactor = 0.25;
    this.controls.enableDamping = true;
    this.controls.enableRotate = false;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.cvsRef.current!,
    });
    this.renderer.setSize(cvs.width, cvs.height);

    const selectionHelper = new SelectionHelper(this.renderer, "selectBox");

    const render = () => {
      this.controls?.update();
      this.renderer?.render(this.scene!, this.camera!);
      requestAnimationFrame(render);
    };

    render();
    this.handlePCDData();

    // window
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("resize", this.handleResizeWindow);
  }

  componentWillUnmount(): void {
    this.controls?.dispose();
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("resize", this.handleResizeWindow);
  }

  handleLockControls = () => {
    if (this.controls?.enableRotate) {
      this.controls.enableRotate = false;
    } else {
      this.controls!.enableRotate = true;
    }
  };

  render(): React.ReactNode {
    return (
      <>
        <button style={{ position: "fixed" }} onClick={this.handleLockControls}>
          锁定
        </button>
        <canvas ref={this.cvsRef} style={{ display: "block" }}></canvas>
      </>
    );
  }
}

export default App;
