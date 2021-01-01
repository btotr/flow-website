<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns="http://www.w3.org/2000/svg" 
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns:core="https://flow.recipes/ns/core#"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:owl="http://www.w3.org/2002/07/owl#"
	xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
	xmlns:schema="http://schema.org/"
	xmlns:skos="http://www.w3.org/2008/05/skos#"
	xmlns:viz="https://flow.recipes/ns/flow-visualiser#">

    
    	<xsl:output method="xml" indent="yes" />
    	


	<!-- Grouping Using the Muenchian Method -->

	<xsl:template match="node()|@*">
		<xsl:copy>
		   <xsl:apply-templates select="node()|@*"/>
		</xsl:copy>
	</xsl:template>

	<xsl:key name="dKey" match="//rdf:Description" use="@rdf:about|@rdf:nodeID"/>
	<xsl:template match="//rdf:Description[generate-id() = generate-id(key('dKey', @rdf:about|@rdf:nodeID)[1])]">
			<xsl:message>copy</xsl:message>
	          <xsl:copy>
                    <xsl:apply-templates select="@*|key('dKey', @rdf:about|@rdf:nodeID)/node()"/>
	          </xsl:copy>
	          	<xsl:call-template name="removetype">
					<xsl:with-param name="description" select="key('dKey', @rdf:about|@rdf:nodeID)" />
    			</xsl:call-template>
	</xsl:template>
	
	<!-- TODO -->
	<xsl:template name="removetype">
		<xsl:param name="description" />
			<xsl:message>d: <xsl:value-of select="./@rdf:about|@rdf:nodeID" /></xsl:message>
			<xsl:for-each select="$description/rdf:type">
				<xsl:message>t: <xsl:value-of select="@rdf:resource" /></xsl:message>
				 <!--xsl:if test="not(rdf:type[@rdf:resource=current()/@rdf:resource[1]])">
	          <xsl:copy>
                    <xsl:apply-templates select="@*"/>
	          </xsl:copy>
        		</xsl:if-->  
			</xsl:for-each>
	</xsl:template>


	<xsl:key name="cuKey" match="core:hasComponentUnit" use="@rdf:nodeID"/>
	<xsl:template match="core:hasComponentUnit[not(generate-id(.) = generate-id(key('cuKey', @rdf:nodeID)[1]))]"/>


	<xsl:key name="mKey" match="core:hasMethod" use="@rdf:resource"/>
	<xsl:template match="core:hasMethod[not(generate-id(.) = generate-id(key('mKey', @rdf:resource)[1]))]"/>
	
	<xsl:key name="dpKey" match="core:depVariationInstruction" use="@rdf:resource"/>
	<xsl:template match="core:depVariationInstruction[not(generate-id(.) = generate-id(key('dpKey', @rdf:resource)[1]))]"/>

</xsl:stylesheet>