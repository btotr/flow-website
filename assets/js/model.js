/*global Comunica, Blob, URL */

function querySparql(sp) {
	console.log("query sparql");
	var engine = Comunica.newEngine();
	engine.query(sp ,   { sources: [ 
			{ type: 'file', value: 'https://flow.recipes/ns/core' },
			{ type: 'file', value: 'https://flow.recipes/ns/schemes' }
		] }).then(function (result){
			engine.resultToString(result, 'application/trig', result.context).then((d) => {
			var res = '';
			d.data.on('data', (a) => { res += a });
			d.data.on('end', () => { 
				console.log(res) ;
				trig2RDFXML(res, addFlowVisualisation);
			});
		});
    });
}

function addFlowVisualisation(recipe){
	console.log("add flow visualisation");
	createDownload(recipe.replace('<?xml version="1.0" encoding="UTF-8"?>', '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="https://flow.recipes/flow-visualizer/flow-visualiser.xsl"?>'));
}

function createDownload(visualRecipe){
	console.log("create download link");
	var blob = new Blob([visualRecipe], {
		type: 'text/xml'
	});
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.innerText = 'enjoy your recipe';
	document.body.appendChild(link);
	
}

function trig2RDFXML(trig, callback){
	console.log("trig2RDFXML");
	var f = new XMLHttpRequest();
    f.open("POST", 'https://jebsye0qkk.execute-api.eu-west-1.amazonaws.com/default/trig2rdfxml', true);
	f.onreadystatechange = function () {
		if(f.readyState === 4) {
            if(f.status === 200 || f.status == 0) {
               var res = f.responseText;
               console.log(res);
               callback(res);
            }
		 }
	};
	f.send('content='+encodeURIComponent(trig));
}

 function format(literals, ...substitutions) {
	    let result = '';
	
	    for (let i = 0; i < substitutions.length; i++) {
	        result += literals[i];
	        result += substitutions[i];
	    }
	    // add the last literal
	    result += literals[literals.length - 1];
	    return result;
}

function loadsparqlFile(file, recipeName, instructions) {
   	let query = format`
			PREFIX core: <https://flow.recipes/ns/core#>
			PREFIX fs: <https://flow.recipes/ns/schemes#>
			
			CONSTRUCT {
			#  recipe	
				?recipeInstance a core:Recipe ;
							 a owl:NamedIndividual ;
							core:instructions _:list ; 
							rdfs:label ?recipeName ;
				.
				_:list rdfs:member ?instruction .
			#  instructions
				?instruction a core:Instruction ;
					a owl:NamedIndividual  ;
					core:hasComponentUnit [
						core:hasComponent ?ingredientConceptInstance ;
						core:weight ?weight ;
						core:componentAddition ?addition ;
					] ;
					core:hasMethod ?methodConceptInstance ;
					core:depVariationInstruction ?depVariationInstruction .
			# method concepts
				?methodConceptInstance a skos:Concept .
				?methodConceptInstance skos:prefLabel ?method .
			# ingredient concepts
				?ingredientConceptInstance a skos:Concept .
				?ingredientConceptInstance skos:prefLabel ?ingredient .
			}
			WHERE {
				BIND("${recipeName}" AS ?recipeName) .
				VALUES (?method ?weight ?ingredient ?addition ?dep)  {
					 ${instructions.map(instruction => `("${instruction.method}" 20 "${instruction.ingredient}" "1" "test")`).join('\n')}
				}
			# don't modify the following lines
				OPTIONAL {
					?methodConcept skos:prefLabel ?method . 
				} .
				BIND(IF(BOUND(?methodConcept), ?methodConcept, IRI(CONCAT("fs:",STR(NOW()), "-", ?method))) AS ?methodConceptInstance) .
				OPTIONAL {
					?ingredientConcept skos:prefLabel ?ingredient . 
				} .
				BIND(IF(BOUND(?ingredientConcept), ?ingredientConcept, IRI(CONCAT("fs:",STR(NOW()), "-", ?ingredient))) AS ?ingredientConceptInstance) .
				BIND( IRI(CONCAT(?recipeName,STR(NOW()), "-", ?method)) AS ?instruction) .
				BIND(IF(!BOUND(?dep), ?dummy, IRI(CONCAT(?recipeName,STR(NOW()), "-", ?dep))) AS ?depVariationInstruction) .
				BIND( IRI(CONCAT(?recipeName,STR(NOW()))) AS ?recipeInstance) .
			}`;
	console.log(query);
    querySparql(query);
}
