/*global Model, View */

function Controller() {
    var self = this;
    this.model = new Model();
    this.view = new View();
	this.view.addInstruction();
	document.getElementById("add").addEventListener("click", function(e){
	    self.view.addInstruction();
	    e.preventDefault();
	});
	document.getElementById("add").addEventListener('keydown', function(e){
	  	if (e.which === 13) self.view.addInstruction();
	});
	document.getElementById("create").addEventListener("click", function(e){
	    self.create();
	    e.preventDefault();
	    return false;
	});
	document.getElementById("create").addEventListener("keydown", function(e){
	    if (e.which === 13) self.create();
	});
}



Controller.prototype.create = function(){
	var instructionElements = document.getElementsByClassName("instruction");
	var instructions = [];
	for (var i=0; i< instructionElements.length;i++) {
		let instruction = instructionElements[i];
		let dep = undefined;
		if (i>0) dep = '"' + instructionElements[i-1].getElementsByClassName("method")[0].value.split(/ \| /)[0] + '"';
		let ingredientElements = instruction.getElementsByClassName("ingredientDiv");
		for (var j=0; j< ingredientElements.length;j++) {
			let ingredient = ingredientElements[j];
			
			let weight = ingredient.getElementsByClassName("weight")[0].value ;
			if (weight) weight = '"' + weight + '"';

			let ingredientV = ingredient.getElementsByClassName("ingredient")[0].value.split(/ \| /)[0] ;
			if (ingredientV) ingredientV = '"' + ingredientV + '"';
			
			let time = instruction.getElementsByClassName("time")[0].value ;
			if (time) time = '"' + time + '"';
			
			let direction = instruction.getElementsByClassName("method")[0].value.split(/ \| /)[1] ;
			if (direction) direction = '"' + direction + '"';
			
			let addition = ingredient.getElementsByClassName("ingredient")[0].value.split(/ \| /)[1] ;
			if (addition) addition = '"' + addition + '"';
			
			instructions.push(
			 	{	method: instruction.getElementsByClassName("method")[0].value.split(/ \| /)[0] , 
			 		ingredient: ingredientV || "UNDEF", 
			 		weight: weight || "UNDEF",
			 		dependency: dep || "UNDEF",
			 		direction: direction || "UNDEF",
			 		addition: addition || "UNDEF",
			 		time: time || "UNDEF"
			 	});
		}
	}
	console.log(instructions) ;
	var self = this;
	this.model.loadsparqlFile(document.getElementById("name").value, instructions, function(recipe){
		
		/*var loadXSL = function (filename){
			var xhttp = new XMLHttpRequest();
			xhttp.open("GET", filename, false);
			xhttp.send("");
			return xhttp.responseXML;
		}
		
		let parser = new DOMParser()
		let xml = parser.parseFromString(recipe, "application/xml")
		console.log(xml)
		
		var xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(loadXSL("https://flow.recipes/flow-visualizer/flow-visualiser.xsl"));
		var result = xsltProcessor.transformToFragment(xml, document);
		console.log(result);
		var ser = new XMLSerializer();
		
		console.log(ser.serializeToString(result));
		var contentVis = ser.serializeToString(result);*/
		
		
	    console.log("add flow visualisation");
	    var content = recipe.replace('<rdf:RDF', '<?xml version="1.0" encoding="utf-8"?><?xml-stylesheet type="text/xsl" href="https://flow.recipes/flow-visualizer/flow-visualiser.xsl"?><rdf:RDF');
	    self.view.createDownload(content,"data");
	    //self.view.createDownload(contentVis, "vis");
	 });
};
