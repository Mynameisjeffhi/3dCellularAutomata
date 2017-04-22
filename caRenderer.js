class CARenderClass {
  constructor (cellularAutomaton, containerElement) {

    this._cellularAutomaton = cellularAutomaton;

    // Initialize all the rendering bits and pieces
    this._camera = new THREE.PerspectiveCamera( 50, containerElement.clientWidth / containerElement.clientHeight, 1, 1000 );
    this._cameraLookAt = new THREE.Vector3(0, 0, 0);
    this._cameraUp = new THREE.Vector3(0, 1, 0);

    this._renderer = new THREE.WebGLRenderer();

    this._scene = new THREE.Scene();

    this._rhombGeometry = new THREE.InstancedBufferGeometry();
    this._rhombPoints = new THREE.BufferAttribute( new Float32Array( [
      -0.5, -0.5, -0.5,
       0.5, -0.5, -0.5,
      -0.5,  0.5, -0.5,
       0.5,  0.5, -0.5,
      -0.5, -0.5,  0.5,
       0.5, -0.5,  0.5,
      -0.5,  0.5,  0.5,
       0.5,  0.5,  0.5,
      -1.0,    0,    0,
       1.0,    0,    0,
         0, -1.0,    0,
         0,  1.0,    0,
         0,    0, -1.0,
         0,    0,  1.0
    ] ), 3 );
    this._rhombIndices = new THREE.BufferAttribute( new Uint16Array( [
      0, 12, 1,
      1, 10, 0,
      1, 12, 3,
      3,  9, 1,
      3, 12, 2,
      2, 11, 3,
      2, 12, 0,
      0,  8, 2,
      7, 11, 6,
      6, 13, 7,
      6,  8, 4,
      4, 13, 6,
      4, 10, 5,
      5, 13, 4,
      5,  9, 7,
      7, 13, 5,
      0, 10, 4,
      4,  8, 0,
      1,  9, 5,
      5, 10, 1,
      2,  8, 6,
      6, 11, 2,
      3, 11, 7,
      7,  9, 3
    ] ), 1);

    var gridBaseSize = this._cellularAutomaton.size();
    var rhombColor = new THREE.Color(0xff3060);
    var rhombColorsArray = new Float32Array( gridBaseSize*2*gridBaseSize*2*gridBaseSize*3 );
    this._rhombColors = new THREE.InstancedBufferAttribute(rhombColorsArray, 3).setDynamic(true);

    var rhombOffsetsArray = new Float32Array( gridBaseSize*2*gridBaseSize*2*gridBaseSize*3 );

    this._rhombOffsets = new THREE.InstancedBufferAttribute(rhombOffsetsArray, 3).setDynamic(true);

    this._rhombGeometry.addAttribute('position', this._rhombPoints);
    this._rhombGeometry.setIndex( this._rhombIndices );
    this._rhombGeometry.addAttribute('color', this._rhombColors);
    this._rhombGeometry.addAttribute('offset', this._rhombOffsets);

    this._material = new THREE.RawShaderMaterial( {
      vertexShader: cellVertexShader,
      fragmentShader: cellFragmentShader,
      transparent: false,
      extensions: {
        derivatives: true
      },
      uniforms: {
        objScale : { value: 1.0 }
      }
    } );

    this._rhombMesh = new THREE.Mesh(this._rhombGeometry, this._material);
    this._scene.add(this._rhombMesh);

    this._renderer.setClearColor( 0x101010 );
    this._renderer.setPixelRatio( window.devicePixelRatio );
    this._renderer.setSize( containerElement.clientWidth, containerElement.clientHeight );
  }

  getDOMElement() {
    return this._renderer.domElement;
  }

  onResize(width, height) {
    this._camera.aspect = width/height;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize( width, height);
  }

  renderScene () {
    this._camera.up = this._cameraUp;
    this._camera.lookAt(this._cameraLookAt);
    this._camera.updateProjectionMatrix();

    this._renderer.render(this._scene,this._camera);
  }

  setCameraPosition (x, y, z) {
    this._camera.position.set(x, y, z);
  }

  setObjectScale(scale) {
    this._material.uniforms.objScale.value = scale;
  }

  setObjectOrientation(q) {
    this._rhombMesh.setRotationFromQuaternion(q);
  }

  buildSceneFromGrid () {
    var totalCellCount = 0;
    var gridXSize = this._cellularAutomaton.size();
    var gridYSize = this._cellularAutomaton.size();
    var gridZSize = this._cellularAutomaton.size()/2;
    for (var zIdx = 0; zIdx < gridZSize; zIdx++) {
      for (var yIdx = 0; yIdx < gridYSize; yIdx++) {
        for (var xIdx = 0; xIdx < gridXSize; xIdx++) {
          var cellColor = this._cellularAutomaton.getValueAt(xIdx, yIdx, zIdx);
          if (cellColor > 0) {
            var worldX = xIdx - (gridXSize/2);
            var worldY = yIdx - (gridYSize/2);
            var worldZ = ((2*zIdx+xIdx+yIdx)%(2*gridZSize))-gridZSize;
            this._rhombOffsets.setXYZ(totalCellCount, worldX, worldY, worldZ);
            this._rhombColors.setXYZ(totalCellCount, 1.0, 0.3, 0.3);
            totalCellCount++;
          }
        }
      }
    }
    this._rhombGeometry.maxInstancedCount = totalCellCount;
    this._rhombOffsets.needsUpdate = true;
    this._rhombColors.needsUpdate = true;
  }
}
