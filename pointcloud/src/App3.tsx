import {
  WebGLRenderer,
  Scene,
  Points,
  BufferGeometry,
  BufferAttribute,
  OrthographicCamera,
  Group,
  WebGLRenderTarget,
  FloatType,
  DataTexture,
  RGBAFormat,
  UVMapping,
  RepeatWrapping,
  NearestFilter,
  Vector2,
  PointsMaterial,
  Texture,
  Vector4,
  Matrix4,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SelectionHelper } from "three/examples/jsm/interactive/SelectionHelper";

class Main {
  scene: Scene;
  camera: OrthographicCamera;
  renderer: WebGLRenderer;

  selectionScene: Scene;
  renderTarget: WebGLRenderTarget;
  selectionCamera: OrthographicCamera;
  selectionBox: Vector4;
  startPoint: Vector2;
  active: boolean;
  public controls: OrbitControls;
  selectionTexture: Texture;
  points: Points;
  pointsGroup: Group;
  pointsModelViewMatrix: Matrix4;
  constructor() {
    this.active = false;
    this.createScene();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = false;
    this.initEvent();
    console.log(navigator.gpu);
  }

  createScene() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.selectionBox = new Vector4();
    this.startPoint = new Vector2();

    this.renderer = new WebGLRenderer({
      alpha: true,
      powerPreference: "high-performance",
      antialias: true,
    });

    this.scene = new Scene();
    this.camera = new OrthographicCamera(-10, 10, 10, -10, 1, 100);
    this.camera.position.set(0, 0, 10);
    this.renderer.setSize(width, height);
    const selectionHelper = new SelectionHelper(this.renderer, "selectBox");
    document.body.appendChild(this.renderer.domElement);
    this.addPointsToScene();
    this.render();
  }

  addPointsToScene() {
    // will much like three.js GPGPU example
    const width = 64;
    const height = 64;
    // points number will be width * height
    const positionsArray = this.createPositionFloat32Array(
      width * height,
      -10,
      10
    );
    const dataTextureData = this.createVec4PositionArray(positionsArray);

    const dataTexture = new DataTexture(
      dataTextureData,
      width,
      height,
      RGBAFormat,
      FloatType,
      UVMapping,
      RepeatWrapping,
      RepeatWrapping,
      NearestFilter,
      NearestFilter
    );
    dataTexture.needsUpdate = true;
    // camera projection matrix as a uniform
    const group = new Group();
    this.scene.add(group);
    this.pointsGroup = group;
    const selectionTexture = this.createSelectScene(positionsArray);
    this.selectionTexture = selectionTexture;
    const points = this.createPoints(
      positionsArray,
      this.selectionTexture,
      width,
      height
    );
    this.points = points;
    group.add(points);

    // output a new texture display the select state of this point;

    // textureFetch the excect pixel value of this texture

    //
  }

  createPoints(
    positionArray: Float32Array,
    selectedMap: Texture,
    width: number,
    height: number
  ) {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positionArray, 3));

    const indexArray = new Int32Array(positionArray.length / 3);
    indexArray.forEach((value, index) => {
      indexArray[index] = index;
      return index;
    });
    geometry.setAttribute("index", new BufferAttribute(indexArray, 1));
    const material = new PointsMaterial({
      color: 0xff0000,
      size: 3,
    });
    const points = new Points(geometry, material);

    const materialUniforms = {
      selectedMap: { value: selectedMap },
      resolution: { value: new Vector2(width, height) },
      selectionBox: { value: this.selectionBox },
    };

    material.userData.uniforms = materialUniforms;

    material.onBeforeCompile = (shader, renderer) => {
      shader.uniforms["selectedMap"] = materialUniforms.selectedMap;
      shader.uniforms["resolution"] = materialUniforms.resolution;
      shader.uniforms["selectionBox"] = materialUniforms.selectionBox;
      shader.uniforms["screenResolution"] = {
        value: new Vector2(window.innerWidth, window.innerHeight),
      };

      // replace vertex param
      shader.vertexShader = shader.vertexShader.replace(
        "#include <clipping_planes_pars_vertex>",
        `#include <clipping_planes_pars_vertex>
        uniform vec4 selectionBox;
        flat varying int pointIndex;
        varying vec2 screenPosition;
        attribute int index;
        // the input texture resolution
        uniform ivec2 resolution;
        // the output scene resolution
        uniform vec2 screenResolution;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <logdepthbuf_vertex>",
        `
      #include <logdepthbuf_vertex>
        pointIndex = index;
        mat4 worldMatrixProjection = projectionMatrix * modelViewMatrix;
        vec4 clip = worldMatrixProjection * vec4( position, 1. );
        screenPosition = screenResolution * ( 1. * clip.xy/clip.w );
      `
      );

      const clipping_planes_pars_fragment = `
      #include <clipping_planes_pars_fragment>
      uniform sampler2D selectedMap; 
      uniform vec4 selectionBox;
      uniform ivec2 resolution;
      flat varying int pointIndex;
      varying vec2 screenPosition;
      uniform vec2 screenResolution;

      `;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <clipping_planes_pars_fragment>",
        clipping_planes_pars_fragment
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
      #include <output_fragment>
      ivec2 texlPosition = ivec2( pointIndex % resolution.x, pointIndex/resolution.x );
      vec4 selected = texelFetch(selectedMap,texlPosition, 0);

      if( selected.x > 0. ) {
        gl_FragColor = vec4( vec3( 1.0,1.0,1.0 ), diffuseColor.a );
      } else {
        gl_FragColor = vec4( diffuseColor );
      }

      vec2 normalizedScreenPosition = screenPosition.xy / screenResolution;
      
      `
      );
    };
    // this.scene.add( points );
    return points;
  }

  readPixelFromRenderTarget() {
    if (this.renderTarget) {
      const width = this.renderTarget.width;
      const height = this.renderTarget.height;
      const buffer = new Uint8Array(width * height * 4);
      this.renderer.readRenderTargetPixels(
        this.renderTarget,
        0,
        0,
        width,
        height,
        buffer
      );
    }
  }

  selectionSceneRender() {
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.clear();
    this.renderer.render(this.selectionScene, this.selectionCamera);

    // Render full screen quad with generated texture

    this.renderer.setRenderTarget(null);
  }

  createVec4PositionArray(source: Float32Array): Float32Array {
    let target = new Float32Array((source.length / 3) * 4);
    target.fill(1);
    let length = source.length / 3;
    for (let i = 0; i < length; i += 1) {
      target[i * 4] = source[i * 3];
      target[i * 4 + 1] = source[i * 3 + 1];
      target[i * 4 + 2] = source[i * 3 + 2];
    }
    return target;
  }

  createPositionFloat32Array(
    count: number,
    minRange: number,
    maxRange: number
  ): Float32Array {
    const position = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const index = i * 3;
      const range = maxRange - minRange;
      position[index] = Math.random() * range + minRange;
      position[index + 1] = Math.random() * range + minRange;
      position[index + 2] = Math.random() * range + minRange;
    }
    return position;
  }

  createSelectScene(sourcePosition: Float32Array): Texture {
    let length = sourcePosition.length / 3;
    // create a new scene it is used for produce the selected index texture
    let width = Math.ceil(Math.sqrt(length));
    let height = Math.ceil(length / width);
    // create position attribute
    let indexArray = new Int32Array(length);
    for (let i = 0; i < length; i++) {
      indexArray[i] = i;
    }
    let indexAttribute = new BufferAttribute(indexArray, 1);
    const size = 1;
    const startX = -width / 2 + size / 2;
    const startY = -height / 2 + size / 2;
    let positionArray = new Float32Array(length * 3);
    positionArray.fill(0.0);
    for (let p = 0; p < length; p++) {
      const row = Math.floor(p / width);
      const clomn = p % width;
      // // x value
      positionArray[p * 3] = startX + clomn * size;
      // y value
      positionArray[p * 3 + 1] = startY + row * size;
      // z value
      positionArray[p * 3 + 2] = 0;
    }
    // position attribute from top left to bottom right just like fill a bit image
    let positionAttribute = new BufferAttribute(positionArray, 3);
    let geometry = new BufferGeometry();
    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("index", indexAttribute);

    //create data texture
    const count = width * height;
    const dataLength = count * 4;
    const positionDataSource = new Float32Array(dataLength);
    positionDataSource.fill(0);

    for (let i = 0; i < count; i++) {
      positionDataSource[i * 4] = sourcePosition[i * 3];
      positionDataSource[i * 4 + 1] = sourcePosition[i * 3 + 1];
      positionDataSource[i * 4 + 2] = sourcePosition[i * 3 + 2];
      // used for check if got a data here should ignore if this value is 0 should ignore
      positionDataSource[i * 4 + 3] = 1;
    }
    // position data hold all source positions
    const positionDataTexture = new DataTexture(
      positionDataSource,
      width,
      height
    );
    positionDataTexture.type = FloatType;
    positionDataTexture.format = RGBAFormat;
    positionDataTexture.needsUpdate = true;
    // make it as material uniform
    // extends the points material

    const material = new PointsMaterial({
      color: 0xff0000,
      size,
    });
    //
    const uniforms = {
      resolution: { value: new Vector2(width, height) },
      screenResolution: { value: new Vector2(10, 10) },
      positionMap: { value: positionDataTexture },
      selectionBox: { value: this.selectionBox },
      // copy from main scene camra
      selectionCameraProjectionMatrix: { value: this.camera.projectionMatrix },
      // copy from main scene points modelViewMatrix
      pointsModelViewMatrix: { value: new Matrix4() },
    };
    this.pointsModelViewMatrix = uniforms.pointsModelViewMatrix.value;
    this.camera.updateProjectionMatrix();

    // uniforms.selectionCameraProjectionMatrix.value = this.camera.projectionMatrix.clone();
    // uniforms.pointsModelViewMatrix.value.copy( this.)

    material.onBeforeCompile = (shader, renderer) => {
      shader.uniforms["positionMap"] = uniforms.positionMap;
      shader.uniforms["resolution"] = uniforms.resolution;
      shader.uniforms["screenResolution"] = uniforms.screenResolution;
      shader.uniforms["selectionBox"] = uniforms.selectionBox;
      shader.uniforms["selectionCameraProjectionMatrix"] =
        uniforms.selectionCameraProjectionMatrix;
      shader.uniforms["pointsModelViewMatrix"] = uniforms.pointsModelViewMatrix;
      // // define vertex uniform and attribute
      shader.vertexShader = shader.vertexShader.replace(
        "#include <clipping_planes_pars_vertex>",
        `#include <clipping_planes_pars_vertex>
        uniform sampler2D positionMap;
        uniform vec4 selectionBox;
        uniform mat4 selectionCameraProjectionMatrix;
        uniform mat4 pointsModelViewMatrix;
        attribute int index;
        flat varying int pointIndex;
        varying vec2 screenPosition;

        uniform ivec2 resolution;
        uniform vec2 screenResolution;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <logdepthbuf_vertex>",
        `
      #include <logdepthbuf_vertex>
        pointIndex = index;
      `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <clipping_planes_pars_fragment>",
        `
        #include <clipping_planes_pars_fragment>
        uniform mat4 selectionCameraProjectionMatrix;
        uniform mat4 pointsModelViewMatrix;
        uniform sampler2D positionMap;
        uniform vec4 selectionBox;
        uniform ivec2 resolution;
        uniform vec2 screenResolution;
        flat varying int pointIndex;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
        #include <output_fragment>
        ivec2 texlPosition = ivec2( pointIndex % resolution.x, pointIndex/resolution.x );
        vec4 pointRealPosition = texelFetch(positionMap, texlPosition,0 );
        // pointRealPosition 
        // get the screen point by pointsModelViewMatrix and selectionCameraProjectionMatrix;

        mat4 worldMatrixProjectionInMain = selectionCameraProjectionMatrix * pointsModelViewMatrix;
        vec4 clip = worldMatrixProjectionInMain * vec4( pointRealPosition.xyz, 1. );
        vec2 normalizedScreenPosition = clip.xy/clip.w ;

        float minX = min( selectionBox.x, selectionBox.z );
        float maxX = max( selectionBox.x, selectionBox.z );
        float minY = min( selectionBox.y, selectionBox.w );
        float maxY = max( selectionBox.y, selectionBox.w );

        if( normalizedScreenPosition.x > minX && normalizedScreenPosition.x < maxX && 
          normalizedScreenPosition.y > minY && normalizedScreenPosition.y < maxY
          ) {
          gl_FragColor = vec4( 1. );
        } else {
          gl_FragColor = vec4( 0.0 );
        }
        `
      );
    };

    const scene = new Scene();
    const camera = new OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      1,
      100
    );
    camera.position.set(0, 0, 2);
    const renderTarget = new WebGLRenderTarget(width, height);

    const selectionPoints = new Points(geometry, material);
    this.renderTarget = renderTarget;
    this.selectionScene = scene;
    this.selectionScene.add(selectionPoints);
    this.selectionCamera = camera;

    this.selectionSceneRender();
    this.readPixelFromRenderTarget();
    return renderTarget.texture;
    //at last will render a texture with width and height
  }

  initEvent() {
    this.renderer.domElement.addEventListener("pointerdown", (e) => {
      const startPoint = new Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        (-e.clientY / window.innerHeight) * 2 + 1
      );
      this.startPoint.x = startPoint.x;
      this.startPoint.y = startPoint.y;
      this.active = true;
    });

    this.renderer.domElement.addEventListener("pointermove", (e) => {
      if (!this.active) return;
      const endPoint = new Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        (-e.clientY / window.innerHeight) * 2 + 1
      );
      this.selectionBox.x = this.startPoint.x;
      this.selectionBox.y = this.startPoint.y;
      this.selectionBox.z = endPoint.x;
      this.selectionBox.w = endPoint.y;
      this.selectionTexture.needsUpdate = true;
      // copy the points  modelViewMatrix
      this.pointsModelViewMatrix.copy(this.points.modelViewMatrix);
    });
    this.renderer.domElement.addEventListener("pointerup", (e) => {
      // this.selectionBox.x = this.selectionBox.y = this.selectionBox.z = this.selectionBox.w = 0;
      this.active = false;
    });

    const button = document.querySelector("#check");
    if (button) {
      button.addEventListener("click", () => {
        this.controls.enabled = !this.controls.enabled;
      });
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => {
      this.selectionSceneRender();
      this.render();
    });
  }
}

new Main();
