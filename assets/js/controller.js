/*global Model, View */

function Controller() {
    var self = this;
    this.model = new Model();
    this.view = new View();
	this.view.addInstruction();
	document.getElementById("add").addEventListener("click", function(){
	    self.view.addInstruction();
	});
	document.getElementById("create").addEventListener("click", function(){
	    self.create();
	    return false;
	});
}

Controller.prototype.create = function(){
	var instructionElements = document.getElementsByClassName("instruction");
	var instructions = [];
	for (var i=0; i< instructionElements.length;i++) {
		let instruction = instructionElements[i];
		let dep = undefined;
		if (i>0) dep = '"' + instructionElements[i-1].getElementsByClassName("method")[0].value + '"';
		let ingredientElements = instruction.getElementsByClassName("ingredientDiv");
		for (var j=0; j< ingredientElements.length;j++) {
			let ingredient = ingredientElements[j];
			
			let weight = ingredient.getElementsByClassName("weight")[0].value ;
			if (weight) weight = '"' + weight + '"';

			let ingredientV = ingredient.getElementsByClassName("ingredient")[0].value ;
			if (ingredientV) ingredientV = '"' + ingredientV + '"';
			
			instructions.push(
			 	{	method: instruction.getElementsByClassName("method")[0].value , 
			 		ingredient: ingredientV || "UNDEF", 
			 		weight: weight || "UNDEF",
			 		dependency: dep || "UNDEF"
			 	});
		}
	}
	console.log(instructions) ;
	var self = this;
	this.model.loadsparqlFile(document.getElementById("name"), instructions, function(recipe){
	    console.log("add flow visualisation");
	    self.view.createDownload(recipe.replace('<?xml version="1.0" encoding="UTF-8"?>', '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="https://flow.recipes/flow-visualizer/flow-visualiser.xsl"?>'));
	 });
};