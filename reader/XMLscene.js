
function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.initLights();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

	this.axis=new CGFaxis(this);
};

XMLscene.prototype.initLights = function () {

    this.shader.bind();

	this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0,1.0,1.0,1.0);
    this.lights[0].update();
 
    this.shader.unbind();
};

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () 
{
	this.gl.clearColor(this.graph.background['r'],this.graph.background['g'],this.graph.background['b'],this.graph.background['a']);
	this.setAmbient(this.graph.ambient['r'],this.graph.ambient['g'],this.graph.ambient['b'],this.graph.ambient['a']);

	this.getLSXLights();

	
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
    this.shader.bind();
	
	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	// Draw axis
	this.axis.display();

	this.setDefaultAppearance();
	
	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk)
	{
		for(var i = 0; i < this.graph.lightsArray.length; i++){
			this.lights[i].update();
		}
	};	

    this.shader.unbind();
};


/*
*
*	Created functions
*
*/

XMLscene.prototype.getLSXLights = function (){

	for(var i = 0; i < this.graph.lightsArray.length; i++){
		
		if(this.graph.lightsArray[i].enabled != null){
			if(this.graph.lightsArray[i].enabled == 1)	this.lights[i].enable();
			else this.lights[i].disable();
		}
		
		this.lights[i].setVisible(true);

		if(this.graph.lightsArray[i].position != null)
			this.lights[i].setPosition(this.graph.lightsArray[i].position.x,
									this.graph.lightsArray[i].position.y,
									this.graph.lightsArray[i].position.z,
									this.graph.lightsArray[i].position.w);

		if(this.graph.lightsArray[i].ambient != null)
			this.lights[i].setAmbient(this.graph.lightsArray[i].ambient.r,
									this.graph.lightsArray[i].ambient.g,
									this.graph.lightsArray[i].ambient.b,
									this.graph.lightsArray[i].ambient.a);

		if(this.graph.lightsArray[i].diffuse != null)
			this.lights[i].setDiffuse(this.graph.lightsArray[i].diffuse.r,
									this.graph.lightsArray[i].diffuse.g,
									this.graph.lightsArray[i].diffuse.b,
									this.graph.lightsArray[i].diffuse.a);

		if(this.graph.lightsArray[i].specular != null)
			this.lights[i].setSpecular(this.graph.lightsArray[i].specular.r,
									this.graph.lightsArray[i].specular.g,
									this.graph.lightsArray[i].specular.b,
									this.graph.lightsArray[i].specular.a);

	}
}