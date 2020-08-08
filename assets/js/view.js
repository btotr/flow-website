/*global Blob, URL */

var View = function() {
};

View.prototype.addInput = function(labelText, required){
	var inputDiv = document.createElement("div");
	var label = document.createElement("label"); 
	label.appendChild(document.createTextNode(labelText));
	var forAttributeMethode = document.createAttribute("for");
	forAttributeMethode.value = labelText;
	label.setAttributeNode(forAttributeMethode);
	inputDiv.appendChild(label);  
	var input = document.createElement("input"); 
	var typeAttributeMethode = document.createAttribute("type");
	typeAttributeMethode.value = "text";
	input.setAttributeNode(typeAttributeMethode);
	if(required){
		var requiredAttributeMethode = document.createAttribute("required");
		input.setAttributeNode(requiredAttributeMethode); 
	}
	var idAttributeMethode = document.createAttribute("id");
	idAttributeMethode.value = labelText+Math.floor(Math.random()*1000);
	input.setAttributeNode(idAttributeMethode);
	input.setAttribute("class", labelText);
	inputDiv.appendChild(input);  
	return inputDiv;
};
		
View.prototype.addIngredient = function(createLink){
	var ingredientDiv = document.createElement("div");
	var self = this;
	ingredientDiv.setAttribute("class", "ingredientDiv");
	ingredientDiv.appendChild(this.addInput("ingredient")); 
	ingredientDiv.appendChild(this.addInput("weight")); 
	if(createLink){
		var addIngredientA = document.createElement("a");
		addIngredientA.setAttribute("tabindex", 0);
		addIngredientA.appendChild(document.createTextNode("add ingredient"));
		ingredientDiv.appendChild(addIngredientA);
		addIngredientA.addEventListener("click", function(e){
			var newIngredient = self.addIngredient(false);
			e.path[2].insertBefore(newIngredient, e.path[1]); 
			newIngredient.getElementsByTagName("input")[0].focus();
			e.preventDefault();
		});
		addIngredientA.addEventListener("keydown", function(e){
			if (e.which === 13) {
				var newIngredient = self.addIngredient(false);
				e.path[2].insertBefore(newIngredient, e.path[1]); 
				newIngredient.getElementsByTagName("input")[0].focus();
			}
		});
	}
	return ingredientDiv;
};

View.prototype.addInstruction = function(){
	var instruction = document.createElement("div"); 
	var self = this;
	instruction.setAttribute("class", "instruction");
	instruction.appendChild(this.addInput("method", true));  
	instruction.appendChild(this.addInput("time"));  
	instruction.appendChild(this.addIngredient(true));  
	var form = document.getElementsByTagName("form")[0]; 
	form.insertBefore(instruction, document.getElementById("add"));
	instruction.getElementsByTagName("input")[0].focus();
};
		
View.prototype.createDownload = function(visualRecipe){
	console.log("create download link");
	var blob = new Blob([visualRecipe], {
		type: 'text/xml'
	});
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.innerText = 'enjoy your recipe';
	const output = document.getElementsByTagName("output")[0];
	output.replaceChild(link, output.firstElementChild);
};
