var cellVertexShader = `
  precision highp float;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float objScale;

  attribute vec3 position;
  attribute vec3 color;
  attribute vec3 offset;

  varying vec3 vColor;
  varying vec3 vPosition;
  varying float vAmbient;

  void main() {

    vPosition = offset + (position * objScale);
    vColor = color;
    vAmbient = 0.4;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0);

  }
`;

var cellFragmentShader = `
  precision highp float;

  varying float vAmbient;
  varying vec3 vPosition;
  varying vec3 vColor;

  void main() {

    vec3 fdx = dFdx( vPosition );
    vec3 fdy = dFdy( vPosition );

    vec3 normal = normalize( cross( fdx, fdy ) );
    float diffuse = max(0.0, dot( normal, vec3( 0.5, 0.0, .867 ) ));
    float totalColor = min( diffuse + vAmbient, 1.0 );
    vec3 rgbColor = vColor * totalColor;
    gl_FragColor = vec4(rgbColor, 1.0);
    // gl_FragColor = vec4(0.8, 0.4, 0.4, 1.0 );

  }
`;
