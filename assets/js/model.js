/*global Comunica xsltProcessor XMLSerializer */

var Model = function() {
}

Model.prototype.querySparql = function(sp, callback){
	console.log("query sparql");
	var engine = Comunica.newEngine();
	var self = this;
	
	/* FIXME use a custom ipfs gateway with proxy to serve the correct content-type for communica
	 *
	 *example nginx
	 *
	 *location /ipns/k51qzi5uqu5djcb94wpxqfvhjnajw30k0pm2c0x9tqrgrgud0fdvqlcokpwt9n/ns/core/ns/ {
	 *	alias /var/www/html/ns/;
	 *	more_clear_headers Content-Type;
	 *	add_header Content-Type "application/n-triples; charset=utf-8" always;
         *	try_files $uri =404;
   	 *}
	 *
	 * */


	//var ipfsGateway = window.location.origin 
	var ipfsGateway = "https://www.meerveld.cc"
	engine.query(sp , { sources: [ 
			{ type: 'file', value: ipfsGateway + '/ipns/k51qzi5uqu5djcb94wpxqfvhjnajw30k0pm2c0x9tqrgrgud0fdvqlcokpwt9n/ns/core' },
			{ type: 'file', value: ipfsGateway + '/ipns/k51qzi5uqu5djcb94wpxqfvhjnajw30k0pm2c0x9tqrgrgud0fdvqlcokpwt9n/ns/schema' }
		] }).then(function (result){
			engine.resultToString(result, 'application/trig', result.context).then((d) => {
			var res = '';
			d.data.on('data', (a) => { res += a });
			d.data.on('end', () => { 
				console.log(res) ;
				var prefix = "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . @prefix core:  <ipns://k51qzi5uqu5djcb94wpxqfvhjnajw30k0pm2c0x9tqrgrgud0fdvqlcokpwt9n/ns/core#> .  @prefix skos: <http://www.w3.org/2008/05/skos#> . ";
				self.trig2RDFXML(prefix + res, callback);
			});
		});
    });
}

Model.prototype.trig2RDFXML = async function(trigString, callback){
	console.log("trig2RDFXML");
	var self = this;
          
            try {
                const quads = await parseTrigToQuads(trigString);
		// console.log('✅ Parsed', quads.length, 'quads', quads);
                const rdfXml = await trigToRdfXmlSimple(quads);
		console.log(rdfXml)    
		self.fixRDFXML(rdfXml, callback);
            } catch (error) {
                console.log(error.message);
            }

        async function parseTrigToQuads(trigString) {
            return new Promise((resolve, reject) => {
                const store = new N3.Store();
                const parser = new N3.Parser();
                parser.parse(trigString, (error, quad, prefixes) => {
                    if (error) {
                        reject(error);
                    } else if (quad) {
                        store.addQuad(quad);
                    } else {
                        resolve(store.getQuads(null, null, null));
                    }
                });
            });
        }


function trigToRdfXmlSimple(quads) {
    const rdfNs = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
    const rdfsNs = 'http://www.w3.org/2000/01/rdf-schema#';
    const xsdNs = 'http://www.w3.org/2001/XMLSchema#';
    const coreNs = 'ipns://k51qzi5uqu5djcb94wpxqfvhjnajw30k0pm2c0x9tqrgrgud0fdvqlcokpwt9n/ns/core#';
    const skosNs = 'http://www.w3.org/2008/05/skos#'; 
    const subjects = {};


    for (const quad of quads) {
        const subj = quad.subject.value;
        if (!subjects[subj]) subjects[subj] = {};
        const pred = quad.predicate.value;
        if (!subjects[subj][pred]) subjects[subj][pred] = [];
        subjects[subj][pred].push(quad.object);
    }

    let rdfXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rdfXml += `<rdf:RDF xmlns:rdf="${rdfNs}" xmlns:rdfs="${rdfsNs}" xmlns:xsd="${xsdNs}" xmlns:core="${coreNs}" xmlns:skos="${skosNs}">\n`;

    for (const [subject, predicates] of Object.entries(subjects)) {
        rdfXml += `  <rdf:Description rdf:about="${subject}">\n`;

        for (const [predicate, objects] of Object.entries(predicates)) {
            const localName = predicate.split('/').pop().split('#').pop();

            const useCorePrefix = predicate.startsWith(coreNs);
            const useSkosPrefix = predicate.startsWith(skosNs);
            const useRDFsPrefix = predicate.startsWith(rdfsNs);

            if (objects.length === 1) {
                const obj = objects[0];
                if (obj.termType === 'NamedNode') {
                    rdfXml += `    <${useCorePrefix ? 'core:' : useSkosPrefix ? 'skos:' : useRDFsPrefix ? 'rdfs:' : ''}${localName} rdf:resource="${obj.value}"/>\n`;
                } else {
                    rdfXml += `    <${useCorePrefix ? 'core:' : useSkosPrefix ? 'skos:' : useRDFsPrefix ? 'rdfs:' :''}${localName}>${escapeXml(obj.value)}</${useCorePrefix ? 'core:' : useSkosPrefix ? 'skos:' : useRDFsPrefix ? 'rdfs:' : ''}${localName}>\n`;
                }
            } else {
                rdfXml += `    <${useCorePrefix ? 'core:' : useSkosPrefix ? 'skos:' : useRDFsPrefix ? 'rdfs:' : ''}${localName}>\n`;
                for (const obj of objects) {
                    rdfXml += `      <rdf:Description rdf:about="${obj.value || obj.id}"></rdf:Description>\n`;
                }
                rdfXml += `    </${useCorePrefix ? 'core:' : useSkosPrefix ? 'skos:' : useRDFsPrefix ? 'rdfs:' : ''}${localName}>\n`;
            }
        }

        rdfXml += `  </rdf:Description>\n`;
    }

    rdfXml += `</rdf:RDF>`;
    return rdfXml;
}

        // XML escape helper
        function escapeXml(str) {
            return str.replace(/[<>&'"]/g, (c) => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case "'": return '&apos;';
                    case '"': return '&quot;';
                }
            });
        }
}




Model.prototype.fixRDFXML = async function(xml, callback){
	var xsltProcessor = new XSLTProcessor();
	const xslResponse = await fetch('assets/xslt/rdf2xml.xslt');
        const xslText = await xslResponse.text();
        const xsltFile = new DOMParser().parseFromString(xslText, 'application/xml');
        const xmlFile = new DOMParser().parseFromString(xml, 'application/xml');
	xsltProcessor.importStylesheet(xsltFile);
	var result = xsltProcessor.transformToFragment(xmlFile, document);
	var ser = new XMLSerializer();
	console.log(result);
	callback(ser.serializeToString(result));
	
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
			PREFIX core: <ipns://k51qzi5uqu5djcb94wpxqfvhjnajw30k0pm2c0x9tqrgrgud0fdvqlcokpwt9n/ns/core#>
			PREFIX fs: <ipns://k51qzi5uqu5djcb94wpxqfvhjnajw30k0pm2c0x9tqrgrgud0fdvqlcokpwt9n/ns/schema#>
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
					# FIXME should use concept frome schema but is broken
					?methodConcept skos:prefLabel ?method . 
				} .
				BIND(IF(BOUND(?methodConcept), ?methodConcept, IRI(CONCAT("fs:m-",SHA256(?method)))) AS ?methodConceptInstance) .
				OPTIONAL {
					?ingredientConcept skos:prefLabel ?ingredient . 
				} .
				BIND(IF(BOUND(?ingredientConcept), ?ingredientConcept, IRI(CONCAT("fs:i-", SHA256(?ingredient)))) AS ?ingredientConceptInstance) .
				BIND(IRI(CONCAT("core:i-", SHA256(CONCAT(STR(NOW()), "-", ?method)))) AS ?instruction) .
				BIND(IF(!BOUND(?dep), ?dummy, IRI(CONCAT("core:i-", SHA256(CONCAT(STR(NOW()), "-", ?dep))))) AS ?depVariationInstruction) .
				BIND(IRI(CONCAT("core:", REPLACE(STR(?recipeName)," ","-") ,"-r-",SHA256(CONCAT(STR(NOW()),?recipeName)))) AS ?recipeInstance) .
				
			}`;
	console.log(query);
    this.querySparql(query, callback);
}
