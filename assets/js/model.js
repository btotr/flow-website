/*global Comunica */

var Model = function() {
}

Model.prototype.querySparql = function(sp, callback){
	console.log("query sparql");
	var engine = Comunica.newEngine();
	var self = this;
	engine.query(sp ,   { sources: [ 
			{ type: 'file', value: 'https://flow.recipes/ns/core' },
			{ type: 'file', value: 'https://flow.recipes/ns/schemes' }
		] }).then(function (result){
			engine.resultToString(result, 'application/trig', result.context).then((d) => {
			var res = '';
			d.data.on('data', (a) => { res += a });
			d.data.on('end', () => { 
				console.log(res) ;
				var prefix = "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . @prefix core:  <https://flow.recipes/ns/core#> .  @prefix skos: <http://www.w3.org/2008/05/skos#> . ";
				self.trig2RDFXML(prefix + res, callback);
			});
		});
    });
}

Model.prototype.trig2RDFXML = function(trig, callback){
	console.log("trig2RDFXML");
	var f = new XMLHttpRequest();
    f.open("POST", 'https://x8nbg8tb0m.execute-api.eu-west-1.amazonaws.com/dev/trig2xml', true);
	f.onreadystatechange = function () {
		if(f.readyState === 4) {
            if(f.status === 200 || f.status == 0) {
               var res = f.responseXML;
                 console.log(res);
               
                var xsltProcessor = new XSLTProcessor();
				xsltProcessor.importStylesheet(loadXSL("assets/xslt/rdf2xml.xslt"));
				result = xsltProcessor.transformToFragment(res, document);
	            console.log(result);
    			callback(result);
					

            }
		 }
	};
	f.send(trig);
}

function loadXSL(filename){
	xhttp = new XMLHttpRequest();
	xhttp.open("GET", filename, false);
	xhttp.send("");
	return xhttp.responseXML;
}


Model.prototype.loadsparqlFile = function(recipeName, instructions, callback) {
	
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
	
   	let query = format`
			PREFIX core: <https://flow.recipes/ns/core#>
			PREFIX fs: <https://flow.recipes/ns/schemes#>
			CONSTRUCT {
							?recipeInstance a core:Recipe ;
							 a owl:NamedIndividual ;
							core:instructions _:list ; 
							rdfs:label ?recipeName ;
				.
				_:list rdfs:member ?instruction .
				?instruction a core:Instruction ;
					a owl:NamedIndividual  ;
					core:hasComponentUnit [
						core:hasComponent ?ingredientConceptInstance ;
						core:weight ?weight ;
						core:componentAddition ?addition;
					];
					core:hasMethod ?methodConceptInstance ;
					core:time ?time ;
					core:direction ?direction ;
					core:depVariationInstruction ?depVariationInstruction .
				?methodConceptInstance a skos:Concept .
				?methodConceptInstance skos:prefLabel ?method .
				?ingredientConceptInstance a skos:Concept .
				?ingredientConceptInstance skos:prefLabel ?ingredient .
			}
			WHERE {
				BIND("${recipeName}" AS ?recipeName) .
				VALUES (?method ?weight ?ingredient ?addition ?dep ?time ?direction)  {
					 ${instructions.map(instruction => `("${instruction.method}" ${instruction.weight} ${instruction.ingredient} ${instruction.addition} ${instruction.dependency} ${instruction.time} ${instruction.direction})`).join('\n')}
				}
				OPTIONAL {
					?methodConcept skos:prefLabel ?method . 
				} .
				BIND(IF(BOUND(?methodConcept), ?methodConcept, IRI(CONCAT("fs:",STR(NOW()), "-", ?method))) AS ?methodConceptInstance) .
				OPTIONAL {
					?ingredientConcept skos:prefLabel ?ingredient . 
				} .
				BIND(IF(BOUND(?ingredientConcept), ?ingredientConcept, IRI(CONCAT("fs:",STR(NOW()), "-", ?ingredient))) AS ?ingredientConceptInstance) .
				BIND( IRI(CONCAT(REPLACE(STR(?recipeName)," ","-") ,STR(NOW()), "-", ?method)) AS ?instruction) .
				BIND(IF(!BOUND(?dep), ?dummy, IRI(CONCAT(REPLACE(STR(?recipeName)," ","-"),STR(NOW()), "-", ?dep))) AS ?depVariationInstruction) .
				BIND( IRI(CONCAT(REPLACE(STR(?recipeName)," ","-") ,STR(NOW()))) AS ?recipeInstance) .
				BIND( IRI(CONCAT(STR(?instruction),STR(NOW()),"-cu")) AS ?cu) .
			}`;
	console.log(query);
    this.querySparql(query, callback);
}
