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
			e.srcElement.parentElement.insertBefore(newIngredient, e.srcElement); 
			newIngredient.getElementsByTagName("input")[0].focus();
			e.preventDefault();
		});
		addIngredientA.addEventListener("keydown", function(e){
			if (e.which === 13) {
				var newIngredient = self.addIngredient(false);
				e.srcElement.parentElement.insertBefore(newIngredient, e.srcElement); 
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
		
View.prototype.createDownload = function(visualRecipe, type){
console.log(visualRecipe)

function xController() {
    console.log("ttttttttttttttttttttttt   Controller") ;
    var svg = document.querySelector("svg");
    var endProces = svg.getElementById("endProcess")
    var endProcesBB = endProces.getBBox();
    var width = endProcesBB.x + endProcesBB.width + 10;
    svg.setAttribute("viewBox", [0, 0, width,1].join(" "));
    var directions = document.getElementsByClassName("direction");
    for (var i = 0; i < directions.length; i++) {
        var direction = directions[i];
        var multiline = createSVGtext(direction.innerHTML, parseInt(direction.getAttribute("x")), parseInt(direction.getAttribute("y")));
        direction.parentNode.appendChild(multiline);
        direction.parentNode.removeChild(direction);
    }
}

function createSVGtext(caption, x, y) {
    //  This function attempts to create a new svg "text" element, chopping 
    //  it up into "tspan" pieces, if the caption is too long
    //
    var svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    svgText.setAttributeNS(null, 'x', x);
    svgText.setAttributeNS(null, 'y', y);
    svgText.setAttributeNS(null, 'font-size', 12);


    var MAXIMUM_CHARS_PER_LINE = 18;
    var LINE_HEIGHT = 16;

    var words = caption.split(" ");
    var line = "";

    for (var n = 0; n < words.length; n++) {

        var testLine = line + words[n] + " ";
        if (testLine.length > MAXIMUM_CHARS_PER_LINE)
        {
            //  Add a new <tspan> element
            var svgTSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            svgTSpan.setAttributeNS(null, 'x', x);
            svgTSpan.setAttributeNS(null, 'y', y);

            var tSpanTextNode = document.createTextNode(line);
            svgTSpan.appendChild(tSpanTextNode);
            svgText.appendChild(svgTSpan);

            line = words[n] + " ";
            y += LINE_HEIGHT;
        }
        else {
            line = testLine;
        }
    }

    var svgTSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    svgTSpan.setAttributeNS(null, 'x', x);
    svgTSpan.setAttributeNS(null, 'y', y);

    var tSpanTextNode = document.createTextNode(line);
    svgTSpan.appendChild(tSpanTextNode);

    svgText.appendChild(svgTSpan);

    return svgText;
}


	
	if (type == "data")	{
		var blob = new Blob([visualRecipe], {
			type: 'text/xml'
		});
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		var output = document.getElementsByTagName("output")[0];
		link.innerText = 'enjoy your recipe!';
		output.replaceChild(link, output.firstElementChild);
	} else {
    	//	const blob = new Blob([visualRecipe], { type: 'image/svg+xml' });
    	//	const blobUrl = URL.createObjectURL(blob);

    		const img = document.createElement('img');
   	//	 img.src = blobUrl;
    		img.style.width = '400px';
    		img.style.height = '200px';
    		img.style.borderRadius = '50%';  // Optional blob styling
		console.log(visualRecipe.firstElementChild.namespaceURI)
    		document.getElementsByTagName('output')[1].appendChild(visualRecipe);
	



		new xController();

	}

	
};
