function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
        0.3536, -0.6124, 0.7071, 0.2082,
        0.6124, 0.3536, 0.7071, -0.1041,
        -0.7071, 0.7071, 0, 0,
        0, 0, 0, 1

    ]);
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function degToRad(degree) {
    return degree * (Math.PI / 180);
}

function getModelViewMatrix() {
    let modelviewMatrix = createIdentityMatrix()
    modelviewMatrix=multiplyMatrices(modelviewMatrix ,createTranslationMatrix(0.3, -0.25,0));
    modelviewMatrix=multiplyMatrices(modelviewMatrix ,createScaleMatrix(0.5, 0.5,1));
    modelviewMatrix=multiplyMatrices(modelviewMatrix ,createRotationMatrix_X(degToRad(30)));
    modelviewMatrix=multiplyMatrices(modelviewMatrix ,createRotationMatrix_Y(degToRad(45)));
    modelviewMatrix=multiplyMatrices(modelviewMatrix ,createRotationMatrix_Z(degToRad(60)));
    // calculate the model view matrix by using the transformation
    // methods and return the modelView matrix in this method
    return getTransposeMatrix(modelviewMatrix);
}

/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */

function getPeriodicMovement(startTime) {
    // this metdo should return the model view matrix at the given time
    // to get a smooth animation
    const elapsedTime = (Date.now() - startTime) % 10000; // Elapsed time in milliseconds (cycles every 10 seconds)

    // Period duration: 0 to 5000 ms (5 seconds)
    if (elapsedTime < 5000) {
        const progress = elapsedTime / 5000; // Progress from 0 to 1
        const targetModelViewMatrix = getModelViewMatrix(); // Get the target model view matrix

        // Interpolate between identity matrix and the target model view matrix based on progress
        return interpolateMatrices(createIdentityMatrix(), targetModelViewMatrix, progress);
    }
    // Period duration: 5000 to 10000 ms (5 seconds)
    else {
        const progress = (elapsedTime - 5000) / 5000; // Progress from 0 to 1
        const initialModelViewMatrix = getModelViewMatrix(); // Get the initial model view matrix

        // Interpolate between the initial model view matrix and identity matrix based on progress
        return interpolateMatrices(initialModelViewMatrix, createIdentityMatrix(), progress);
    }
}

// Function to interpolate between two matrices
function interpolateMatrices(matrixA, matrixB, progress) {
    const result = [];

    for (let i = 0; i < matrixA.length; i++) {
        result[i] = matrixA[i] + (matrixB[i] - matrixA[i]) * progress;
    }

    return new Float32Array(result);
}



