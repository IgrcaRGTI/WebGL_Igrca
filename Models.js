'use strict';
/*
Informacija za font
*/
var fontInfo =
    {
        letterHeight: 8,
        spaceWidth: 8,
        spacing: -1,
        textureWidth: 64,
        textrueHeight: 40,
        glyphInfos:
        {
            '0': { x: 16, y: 24, width: 8, },
            '1': { x: 24, y: 24, width: 8, },
            '2': { x: 32, y: 24, width: 8, },
            '3': { x: 40, y: 24, width: 8, },
            '4': { x: 48, y: 24, width: 8, },
            '5': { x: 56, y: 24, width: 8, },
            '6': { x: 0, y: 32, width: 8, },
            '7': { x: 8, y: 32, width: 8, },
            '8': { x: 16, y: 32, width: 8, },
            '9': { x: 24, y: 32, width: 8, },
            '-': { x: 32, y: 32, width: 8, },
            '*': { x: 40, y: 32, width: 8, },
            '!': { x: 48, y: 32, width: 8, },
            '?': { x: 56, y: 32, width: 8, },
        }
    };
var canvasTexture;
/*
*
*Deklaracija za modele, objekt se uporablja v LightMapDemoScene
*
*/

var Model = function (gl, vertices, indices, normals, color) {
    this.vbo = gl.createBuffer();
    this.ibo = gl.createBuffer();
    this.nbo = gl.createBuffer();
    this.nPoints = indices.length;

    this.world = mat4.create();
    this.color = color;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};
//Inicializacija texta

function initTextures() {
    canvasTexture = gl.createTexture();
    handleLoadedTexture(canvasTexture, document.getElementById("gl-surface"));
}
function handleLoadedTexture(texture, textureCanvas) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.Image2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
    gl.textParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.textParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

var CreateShaderProgram = function (gl, vsText, fsText) {
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsText);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        return {
            error: 'Error compiling vertex shader: ' + gl.getShaderInfoLog(vs)
        };
    }

    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsText);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        return {
            error: 'Error compiling fragment shader: ' + gl.getShaderInfoLog(fs)
        };
    }

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return {
            error: 'Error linking program: ' + gl.getProgramInfoLog(program)
        };
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        return {
            error: 'Error validating program: ' + gl.getProgramInfoLog(program)
        };
    }

    return program;

};

/*
*
*Deklaracija kamere, uporablja se v LightMapDemoScene
*
*/

var Camera = function (position, lookAt, up) {
    this.forward = vec3.create();
    this.up = vec3.create();
    this.right = vec3.create();

    this.position = position;

    vec3.subtract(this.forward, lookAt, this.position);
    vec3.cross(this.right, this.forward, up);
    vec3.cross(this.up, this.right, this.forward);

    vec3.normalize(this.forward, this.forward);
    vec3.normalize(this.right, this.right);
    vec3.normalize(this.up, this.up);
};

Camera.prototype.GetViewMatrix = function (out) {
    var lookAt = vec3.create();
    vec3.add(lookAt, this.position, this.forward);
    mat4.lookAt(out, this.position, lookAt, this.up);
    return out;
};

Camera.prototype.rotateRight = function (rad) {
    var rightMatrix = mat4.create();
    mat4.rotate(rightMatrix, rightMatrix, rad, vec3.fromValues(0, 0, 1));
    vec3.transformMat4(this.forward, this.forward, rightMatrix);
    this._realign();
};

Camera.prototype._realign = function () {
    vec3.cross(this.right, this.forward, this.up);
    vec3.cross(this.up, this.right, this.forward);

    vec3.normalize(this.forward, this.forward);
    vec3.normalize(this.right, this.right);
    vec3.normalize(this.up, this.up);
};

Camera.prototype.moveForward = function (dist) {
 // var a=  CanIMove(ReturnMeshes(), this.position, this.position, this.forward, dist);
    vec3.scaleAndAdd(this.position, this.position, this.forward, dist);
};

Camera.prototype.moveRight = function (dist) {
    vec3.scaleAndAdd(this.position, this.position, this.right, dist);
};

Camera.prototype.moveUp = function (dist) {
    vec3.scaleAndAdd(this.position, this.position, this.up, dist);
};
