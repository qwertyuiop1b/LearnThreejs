
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