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
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
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
    this.startPoint = new THREE.Vector3();
    this.endPoint = new THREE.Vector3();
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

      const materialUniforms = {
        startPoint: {
          value: this.startPoint.unproject(this.camera!),
        },
        endPoint: { value: this.endPoint.unproject(this.camera!)},
      };
      console.log(this.points.material);
      const material = this.points.material as THREE.Material
      material.userData.uniform = materialUniforms;

      material.onBeforeCompile = (shader: THREE.Shader, renderer: THREE.WebGLRenderer) => {
        console.log(shader, renderer)
        shader.uniforms["startPoint"] = materialUniforms.startPoint
        shader.uniforms["endPoint"] = materialUniforms.endPoint

      }

      this.scene.add(this.points);
    });
  };

  handleMouseDown = (evt: MouseEvent) => {
    this.startPoint.x = (evt.clientX / window.innerWidth) * 2 - 1;
    this.startPoint.y = -((evt.clientY / window.innerHeight) * 2 - 1);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  };

  handleMouseMove = (evt: MouseEvent) => {
    this.endPoint.x = (evt.clientX / window.innerWidth) * 2 - 1;
    this.endPoint.y = -((evt.clientY / window.innerHeight) * 2 - 1);
  };

  handleMouseUp = (evt: MouseEvent) => {
    this.endPoint.x = (evt.clientX / window.innerWidth) * 2 - 1;
    this.endPoint.y = -((evt.clientY / window.innerHeight) * 2 - 1);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
  };

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
