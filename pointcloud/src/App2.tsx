import React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";
import { SelectionHelper } from "three/examples/jsm/interactive/SelectionHelper";
class App extends React.Component {
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.PerspectiveCamera | null;
  controls: OrbitControls | null;
  cvsRef: React.RefObject<HTMLCanvasElement>;
  cvsRef2: React.RefObject<HTMLCanvasElement>;
  points: THREE.Points | null;
  selectionBox: SelectionBox | null;
  selectionHelper: SelectionHelper | null;

  constructor(props: any) {
    super(props);
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this.cvsRef = React.createRef();
    this.cvsRef2 = React.createRef();
    this.points = null;
    this.selectionBox = null;
    this.selectionHelper = null;

    this.state = {};
  }

  handleResizeWindow = () => {
    this.cvsRef.current!.width = window.innerWidth;
    this.cvsRef.current!.height = window.innerHeight;
    this.renderer?.setSize(window.innerWidth, window.innerHeight);
    this.camera?.updateMatrix();
  };

  hanldeMouseDown = (evt: MouseEvent) => {
    this.selectionBox!.startPoint.set(
      (evt.clientX / window.innerWidth) * 2 - 1,
      -(evt.clientY / window.innerHeight) * 2 + 1,
      0.5
    );

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  };

  handleMouseMove = (evt: MouseEvent) => {
    if (this.selectionHelper?.isDown) {
      for (let i = 0; i < this.selectionBox!.collection.length; i++) {
        console.log(this.selectionBox?.collection);
      }
      this.selectionBox!.endPoint.set(
        (evt.clientX / window.innerWidth) * 2 - 1,
        -(evt.clientY / window.innerHeight) * 2 + 1,
        0.5
      );

      const allSelected = this.selectionBox?.select();
      console.log("all", allSelected);
    }
  };

  handleMouseUp = (evt: MouseEvent) => {
    this.selectionBox!.endPoint.set(
      (evt.clientX / window.innerWidth) * 2 - 1,
      -(evt.clientY / window.innerHeight) * 2 + 1,
      0.5
    );

    const allSelected = this.selectionBox?.select();
    console.log("up", allSelected);

    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
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

    const count = 50000;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() * 2 - 1) * 50;
      positions[i3 + 1] = (Math.random() * 2 - 1) * 30;
      positions[i3 + 2] = (Math.random() * 2 - 1) * 20;

      colors[i3] = 1;
      colors[i3 + 1] = 1;
      colors[i3 + 2] = 1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const pointMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.03,
      vertexColors: true,
    });

    this.points = new THREE.Points(geometry, pointMaterial);
    this.scene.add(this.points);

    this.controls = new OrbitControls(this.camera, cvs);
    this.controls.dampingFactor = 0.25;
    this.controls.enableDamping = true;
    this.controls.enableRotate = false;
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

    this.selectionBox = new SelectionBox(this.camera, this.scene);
    this.selectionHelper = new SelectionHelper(this.renderer, "selectBox");

    const render = () => {
      this.controls?.update();
      this.renderer?.render(this.scene!, this.camera!);
      requestAnimationFrame(render);
    };

    render();

    // window
    window.addEventListener("mousedown", this.hanldeMouseDown);
    window.addEventListener("resize", this.handleResizeWindow);
  }

  componentWillUnmount(): void {
    this.controls?.dispose();
    this.scene?.remove(this.points!);
    window.removeEventListener("mousedown", this.hanldeMouseDown);
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
        <canvas
          ref={this.cvsRef2}
          style={{
            display: "block",
            position: "fixed",
            right: 0,
            top: 0,
            zIndex: 1,
          }}
        ></canvas>
      </>
    );
  }
}

export default App;
