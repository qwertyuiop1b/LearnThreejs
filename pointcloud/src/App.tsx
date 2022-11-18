import React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader";

class App extends React.Component {
  scene: THREE.Scene | null;
  renderer: THREE.Renderer | null;
  camera: THREE.PerspectiveCamera | null;
  controls: OrbitControls | null;
  cvsRef: React.RefObject<HTMLCanvasElement>;

  constructor(props: any) {
    super(props);
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this.cvsRef = React.createRef();
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
    loader.load("/000053.pcd", (points) => {
      this.scene?.add(points);
    });
  };

  componentDidMount(): void {
    const cvs = this.cvsRef.current!;
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      cvs.width / cvs.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 30);

    const helper = new THREE.AxesHelper(12);
    this.scene.add(helper);

    this.controls = new OrbitControls(this.camera, cvs);
    this.controls.dampingFactor = 0.25;
    this.controls.enableDamping = true;
    // this.controls.enableRotate = false;
    this.controls.keys = {
      LEFT: "ArrowLeft", //left arrow
      UP: "ArrowUp", // up arrow
      RIGHT: "ArrowRight", // right arrow
      BOTTOM: "ArrowDown", // down arrow
    };

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.cvsRef.current!,
    });
    this.renderer.setSize(cvs.width, cvs.height);

    const render = () => {
      this.controls?.update();
      this.renderer?.render(this.scene!, this.camera!);
      requestAnimationFrame(render);
    };

    render();
    this.handlePCDData();

    // window
    window.addEventListener("resize", this.handleResizeWindow);
  }

  componentWillUnmount(): void {
    this.controls?.dispose();
    window.removeEventListener("resize", this.handleResizeWindow);
  }

  handleLockControls = () => {
    if (this.controls?.enableRotate) {
      this.controls.enableRotate = false
    } else {
      this.controls!.enableRotate = true
    }
  }

  render(): React.ReactNode {
    return (
      <>
        <button style={{position: "fixed"}} onClick={this.handleLockControls}>锁定</button>
        <canvas ref={this.cvsRef} style={{ display: "block" }}></canvas>
      </>
    );
  }
}

export default App;
