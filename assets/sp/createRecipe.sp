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
	BIND("Risotto" AS ?recipeName) .
	VALUES (?method ?weight ?ingredient ?addition ?dep)  {
		("fijnsnijden"  20 "ui" "1" UNDEF)
		("fruiten"  400 "risottorijst" UNDEF "fijnsnijden")
		("afblussen" "100" "wijn" UNDEF "fruiten") 
		("koken" "1,5L" "kippenbouilion" UNDEF "afblussen") 
		("toevoegen" "75" "parmazaansekaas" UNDEF "koken") 
		("toevoegen" "30" "boter" UNDEF "koken") 
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
}