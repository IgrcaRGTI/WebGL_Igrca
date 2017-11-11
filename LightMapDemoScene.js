'use strict';



var LightMapDemoScene = function (gl) {
	this.gl = gl;
};

LightMapDemoScene.prototype.Load = function (cb) {

/*
* var me, samo zato da ni treba skos pisat this
*
*/
	var me = this;
/*
* Nalaganje modelov, RoomModel = deklaracija prostora
*/
	async.parallel({
		Models: function (callback) {
			async.map({
				RoomModel: 'Room.json'
			}, LoadJSONResource, callback);
		},
		ShaderCode: function (callback) {
			async.map({
				'NoShadow_VSText': 'shaders/NoShadow.vs.glsl',
				'NoShadow_FSText': 'shaders/NoShadow.fs.glsl'
			}, LoadTextResource, callback);
		}
	}, function (loadErrors, loadResults) {
		if (loadErrors) {
			cb(loadErrors);
			return;
		}

/*
* Nalaganje modelov iz funkcije, ki se nahajajo v RoomModel( for zanka se
* sprehodi skozi modele v nekem j.sonu), v tem primeru so manual notr vneseni
* da se tudi brez case-ov..
*
*/
		for (var i = 0; i < loadResults.Models.RoomModel.meshes.length; i++) {
			var mesh = loadResults.Models.RoomModel.meshes[i];
			switch (mesh.name) {
				case 'MonkeyMesh':
					me.MonkeyMesh = new Model(
						me.gl,
						mesh.vertices,
						[].concat.apply([], mesh.faces),
						mesh.normals,
						vec4.fromValues(0.8, 0.8, 1.0, 1.0)
					);
					  mat4.translate(
						me.MonkeyMesh.world, me.MonkeyMesh.world,
						vec4.fromValues(2.07919, -0.98559, 1.75740)
					);
					mat4.rotate(
						me.MonkeyMesh.world, me.MonkeyMesh.world,
						glMatrix.toRadian(94.87),
						vec3.fromValues(0, 0, -1)
					);
					break;
				case 'TableMesh':
					me.TableMesh = new Model(
						me.gl, mesh.vertices, [].concat.apply([], mesh.faces),
						mesh.normals, vec4.fromValues(1, 0, 1, 1)
					);
					mat4.translate(
						me.TableMesh.world, me.TableMesh.world,
						vec3.fromValues(1.57116, -0.79374, 0.49672)
					);
					break;
				case 'SofaMesh':
					me.SofaMesh = new Model(
						me.gl, mesh.vertices, [].concat.apply([], mesh.faces),
						mesh.normals, vec4.fromValues(1, 0, 1, 1)
					);
					mat4.translate(
						me.SofaMesh.world, me.SofaMesh.world,
						vec3.fromValues(-3.28768, 0, 0.78448)
					);
					break;
				case 'LightBulbMesh':
					me.lightPosition = vec3.fromValues(0, 0.0, 2.98971);
					me.LightMesh = new Model(
						me.gl, mesh.vertices, [].concat.apply([], mesh.faces),
						mesh.normals, vec4.fromValues(4, 4, 4, 1)
					);
					mat4.translate(me.LightMesh.world, me.LightMesh.world,
						me.lightPosition
					);
					break;
				case 'WallsMesh':
					me.WallsMesh = new Model(
						me.gl, mesh.vertices, [].concat.apply([], mesh.faces),
						mesh.normals, vec4.fromValues(0.8, 0.8, 1.0, 1.0)
					);
					break;
			}
		}

		if (!me.MonkeyMesh) {
			cb('Failed to load monkey mesh'); return;
		}
		if (!me.TableMesh) {
			cb('Failed to load table mesh'); return;
		}
		if (!me.SofaMesh) {
			cb('Failed to load sofa mesh'); return;
		}
		if (!me.LightMesh) {
			cb('Failed to load light mesh'); return;
		}
		if (!me.WallsMesh) {
			cb('Failed to load walls mesh'); return;
		}
		me.Meshes = [
			me.MonkeyMesh,
			me.TableMesh,
			me.SofaMesh,
			me.LightMesh,
			me.WallsMesh
		];

		me.NoShadowProgram = CreateShaderProgram(
			me.gl, loadResults.ShaderCode.NoShadow_VSText,
			loadResults.ShaderCode.NoShadow_FSText
		);
		if (me.NoShadowProgram.error) {
			cb(me.NoShadowProgram.error); return;
		}

		me.NoShadowProgram.uniforms = {
			mProj: me.gl.getUniformLocation(me.NoShadowProgram, 'mProj'),
			mView: me.gl.getUniformLocation(me.NoShadowProgram, 'mView'),
			mWorld: me.gl.getUniformLocation(me.NoShadowProgram, 'mWorld'),

			pointLightPosition: me.gl.getUniformLocation(me.NoShadowProgram, 'pointLightPosition'),
			meshColor: me.gl.getUniformLocation(me.NoShadowProgram, 'meshColor'),
		};
		me.NoShadowProgram.attribs = {
			vPos: me.gl.getAttribLocation(me.NoShadowProgram, 'vPos'),
			vNorm: me.gl.getAttribLocation(me.NoShadowProgram, 'vNorm'),
		};

/*
*
* Deklaracija kamere ter gumbov za premikanje kamere.
*
*/
		me.camera = new Camera(
			vec3.fromValues(4, 4, 1.85),
			vec3.fromValues(-0.3, -1, 1.85),
			vec3.fromValues(0, 0, 1)
		);

		me.projMatrix = mat4.create();
		me.viewMatrix = mat4.create();

		mat4.perspective(
			me.projMatrix,
			glMatrix.toRadian(90),
			me.gl.canvas.width / me.gl.canvas.height,
			0.35,
			85.0
		);

		cb();
	});

	me.PressedKeys = {
		Up: false,
		Right: false,
		Down: false,
		Left: false,
		Forward: false,
		Back: false,

		RotLeft: false,
		RotRight: false,
	};

	me.MoveForwardSpeed = 3.5;
	me.RotateSpeed = 1.5;
};

LightMapDemoScene.prototype.Unload = function () {
	this.LightMesh = null;
	this.MonkeyMesh = null;
	this.TableMesh = null;
	this.SofaMesh = null;
	this.WallsMesh = null;

	this.NoShadowProgram = null;

	this.camera = null;
	this.lightPosition = null;

	this.Meshes = null;

	me.PressedKeys = null;

	me.MoveForwardSpeed = null;
	me.RotateSpeed = null;
};

LightMapDemoScene.prototype.Begin = function () {


	var me = this;

	this.__ResizeWindowListener = this._OnResizeWindow.bind(this);
	this.__KeyDownWindowListener = this._OnKeyDown.bind(this);
	this.__KeyUpWindowListener = this._OnKeyUp.bind(this);

	AddEvent(window, 'resize', this.__ResizeWindowListener);
	AddEvent(window, 'keydown', this.__KeyDownWindowListener);
	AddEvent(window, 'keyup', this.__KeyUpWindowListener);

/*
*
* Premikanje ter render
*
*/
	var previousFrame = performance.now();
	var dt = 0;
	var loop = function (currentFrameTime) {
		dt = currentFrameTime - previousFrame;
		me._Update(dt);
		previousFrame = currentFrameTime;

		me._Render();
		me.nextFrameHandle = requestAnimationFrame(loop);
	};
	me.nextFrameHandle = requestAnimationFrame(loop);

	me._OnResizeWindow();
};

LightMapDemoScene.prototype.End = function () {
	if (this.__ResizeWindowListener) {
		RemoveEvent(window, 'resize', this.__ResizeWindowListener);
	}
	if (this.__KeyUpWindowListener) {
		RemoveEvent(window, 'keyup', this.__KeyUpWindowListener);
	}
	if (this.__KeyDownWindowListener) {
		RemoveEvent(window, 'keydown', this.__KeyDownWindowListener);
	}

	if (this.nextFrameHandle) {
		cancelAnimationFrame(this.nextFrameHandle);
	}
};

/*
*
* Funkcije, da se ne mors hkrati premikat v dve smeri
*
*/
LightMapDemoScene.prototype._Update = function (dt) {


	if (this.PressedKeys.Forward && !this.PressedKeys.Back) {
		this.camera.moveForward(dt / 1000 * this.MoveForwardSpeed);
	}

	if (this.PressedKeys.Back && !this.PressedKeys.Forward) {
		this.camera.moveForward(-dt / 1000 * this.MoveForwardSpeed);
	}

	if (this.PressedKeys.Right && !this.PressedKeys.Left) {
		this.camera.moveRight(dt / 1000 * this.MoveForwardSpeed);
	}

	if (this.PressedKeys.Left && !this.PressedKeys.Right) {
		this.camera.moveRight(-dt / 1000 * this.MoveForwardSpeed);
	}

	if (this.PressedKeys.Up && !this.PressedKeys.Down) {
		this.camera.moveUp(dt / 1000 * this.MoveForwardSpeed);
	}

	if (this.PressedKeys.Down && !this.PressedKeys.Up) {
		this.camera.moveUp(-dt / 1000 * this.MoveForwardSpeed);
	}

	if (this.PressedKeys.RotRight && !this.PressedKeys.RotLeft) {
		this.camera.rotateRight(-dt / 800 * this.RotateSpeed);
	}

	if (this.PressedKeys.RotLeft && !this.PressedKeys.RotRight) {
		this.camera.rotateRight(dt / 800 * this.RotateSpeed);
	}

	this.camera.GetViewMatrix(this.viewMatrix);
};

LightMapDemoScene.prototype._Render = function () {
	var gl = this.gl;


	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	gl.useProgram(this.NoShadowProgram);
	gl.uniformMatrix4fv(this.NoShadowProgram.uniforms.mProj, gl.FALSE, this.projMatrix);
	gl.uniformMatrix4fv(this.NoShadowProgram.uniforms.mView, gl.FALSE, this.viewMatrix);
	gl.uniform3fv(this.NoShadowProgram.uniforms.pointLightPosition, this.lightPosition);

/*
*
* Risanje modelov(mesh)
*
*/
	for (var i = 0; i < this.Meshes.length; i++) {
		// Per object uniforms
		gl.uniformMatrix4fv(
			this.NoShadowProgram.uniforms.mWorld,
			gl.FALSE,
			this.Meshes[i].world
		);
		gl.uniform4fv(
			this.NoShadowProgram.uniforms.meshColor,
			this.Meshes[i].color
		);

		// Set attributes
		gl.bindBuffer(gl.ARRAY_BUFFER, this.Meshes[i].vbo);
		gl.vertexAttribPointer(
			this.NoShadowProgram.attribs.vPos,
			3, gl.FLOAT, gl.FALSE,
			0, 0
		);
		gl.enableVertexAttribArray(this.NoShadowProgram.attribs.vPos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.Meshes[i].nbo);
		gl.vertexAttribPointer(
			this.NoShadowProgram.attribs.vNorm,
			3, gl.FLOAT, gl.FALSE,
			0, 0
		);
		gl.enableVertexAttribArray(this.NoShadowProgram.attribs.vNorm);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.Meshes[i].ibo);
		gl.drawElements(gl.TRIANGLES, this.Meshes[i].nPoints, gl.UNSIGNED_SHORT, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
};


LightMapDemoScene.prototype._OnResizeWindow = function () {

	var gl = this.gl;

	var targetHeight = window.innerWidth * 9 / 16;

	if (window.innerHeight > targetHeight) {
		gl.canvas.width = window.innerWidth;
		gl.canvas.height = targetHeight;
		gl.canvas.style.left = '0';
		gl.canvas.style.top = (window.innerHeight - targetHeight) / 2 + 'px';
	} else {
		gl.canvas.width = (window.innerHeight) * 16 / 9;
		gl.canvas.height = window.innerHeight;
		gl.canvas.style.left = (window.innerWidth - (gl.canvas.width)) / 2 + 'px';
		gl.canvas.style.top = '0';
	}

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};

LightMapDemoScene.prototype._OnKeyDown = function (e) {
	switch(e.code) {
		case 'KeyW':
			this.PressedKeys.Forward = true;
			break;
		case 'KeyQ':
			this.PressedKeys.Left = true;
			break;
		case 'KeyE':
			this.PressedKeys.Right = true;
			break;
		case 'KeyS':
			this.PressedKeys.Back = true;
			break;
		case 'ArrowUp':
			this.PressedKeys.Up = true;
			break;
		case 'ArrowDown':
			this.PressedKeys.Down = true;
			break;
		case 'KeyD':
			this.PressedKeys.RotRight = true;
			break;
		case 'KeyA':
			this.PressedKeys.RotLeft = true;
			break;
	}
};

LightMapDemoScene.prototype._OnKeyUp = function (e) {
	switch(e.code) {
		case 'KeyW':
			this.PressedKeys.Forward = false;
			break;
		case 'KeyQ':
			this.PressedKeys.Left = false;
			break;
		case 'KeyE':
			this.PressedKeys.Right = false;
			break;
		case 'KeyS':
			this.PressedKeys.Back = false;
			break;
		case 'ArrowUp':
			this.PressedKeys.Up = false;
			break;
		case 'ArrowDown':
			this.PressedKeys.Down = false;
			break;
		case 'KeyD':
			this.PressedKeys.RotRight = false;
			break;
		case 'KeyA':
			this.PressedKeys.RotLeft = false;
			break;
	}
};
