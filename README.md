# Description

This is a demo page (Main) for the "JSON Search UI with JavaScript" CloudSpokes Challenge (CSC1903).
The page uses some mockup json data defined in javascript, allowing the user to query results from this dataset. The query can be filtered for specific properties of the objects in the dataset controlled by some checkboxes. The query string itself may contain the following control commands:

* <strong>OR</strong> term, example query 'Macao green'
* <strong>AND</strong> term, example query 'Macao +green'
* <strong>NOT</strong> term, example query 'Macao -indigo'
* any of these mixed, example query 'Macao -9 +green +indigo'

The results obtained by the CSC1903.search method are returned as a "weight-sorted" array, where the "weight" of each result depends on the number of occurrence of the matching search terms. Best match is the result with the most weight.

Classes are tested with [Jasmine](http://pivotal.github.com/jasmine/), source for test classes can be found inside the folder <strong>./src/test/spec</strong>.

Main class is inside the folder <strong>./src/main/js</strong>.

## Project folder structure
<pre>
csc1903						project root
 |
 |-lib						contains third-party libraries
 |---google.closure			google closure compiler binaries, used in ANT
 |---jasmine-1.2.0			jasmine unit testing
 |
 |-src						contains the source of the project
 |---main					this folder contains the application source
 |-----css					styles
 |-------cupertino
 |---------images
 |-----js					here is the CSC1903.js class located
 |---test					folder with files for running tests
 |-----spec					test specifications 
</pre>

## Class usage

To get the results from an array of Objects, call the CSC1903.search public method of the class. The methods signature is
<code>CSC1903.search(searchTerm, inputArray, attributes)</code>
About details of the calling arguments, please read the function description inside the class.

# Installation / deployment

## Setting up project folder

Create a folder in Your workspace:
<pre>$ cd ~/workspace
~workspace$ mkdir csc1903</pre>

## Getting source

Unpack the submitted zip archive:
<pre>~workspace/csc1903$ unzip csc1903.zip</pre>
	
or alternatively get source from git:
<pre>~workspace$ git clone https://github.com/bitbay/csc1884.git</pre>

## Configuration

The only configuration is located in the <strong>CSC1903.js</strong> file, inside the Logger class - DEBUG. This controls whether the application should log it's progress to the the console or not.

The ANT <strong>build.xml</strong> has a browser.exe property that may need adjustments for Your system. If the browser You want to use is inside Your $PATH, just change this property value to the name of the browsers executable You would like to use. Alternatively You can define the absolute path containing the executable (with the executable at the end).

## Compiling the application

The application uses ANT for the compiling, deploying and testing, so compilation is as straightforward as:
<pre>~workspace/csc1903$ ant all</pre>

This will compile all sources into the <strong>./build</strong> folder, populate the <strong>./dist</strong> folder with a ready to deploy version of the demo application (with the production-ready, compressed js class), and finally open up a browser with the main html page.

By default, the application does not log debug messages to the console. To turn them on, set the Logger class DEBUG field to true.

To see all the available ANT tasks, type 
<pre>~workspace/csc1903$ ant help</pre>
or simply
<pre>~workspace/csc1903$ ant</pre>
from the project directory (where the build.xml is).

## Running the application

Run with ANT, typing:
<pre>~workspace/csc1903$ ant run</pre>

Alternatively, You could navigate with a browser to <strong>./dist/Jsearch.html</strong>.

## Running tests

To run the Jasmin specs included using ANT, type:
<pre>~workspace/csc1903$ ant test-run</pre>

This will build the application including <strong>./build/test</strong> folder, and open the <strong>./build/test/SpecRunner.html</strong> file in the browser.

Notes on test warnings.
The application depends on/uses the jQuery plugin, and throws some warnings about not defined variables/methods of it, even with the closure compilers @externs_url directive. Till now i was not able to determine if it is caused by bugs or my lack of knowledge.

# Application Internals

## About the search term parsing

Basically, the search term may contain three type of control commands, <strong>OR</strong>, <strong>AND</strong>, and <strong>NOT</strong>, as many times as the User needs and in any order/mixing. All of these can be without quotes (words) or quoted (complex terms). The <strong>AND</strong> control is defined by the plus '+' sign, the <strong>NOT</strong> command is defined by the minus '-' sign, and the <strong>OR</strong> has no special control character (each matched term in the search string without +/- will be considered to be of this type).

## HTML page

Some modifications done to the original html:
* the results are passed around as argument to the following functions:
		showResults(results)
		createTable(results)
* generally, checkbox inputs in html should have their value property set. In this case these value properties should match the attribute field names in the to-be-checked objects. (as in --input type="checkbox" value="color"-- would correspond to {color:""}) These could be interpreted as "hard-coded" constants/values...

More inplementation changes are done inside the function searchclick(). Please read the comments/annotations inside that function for details.

## CSC1903 class

The search function basically does two things: splits the search term into OR, AND, and NOT chunks, saving them in a splittedTerms object with these three properties.
<pre>var splittedTerms = { or: [], and: [], not: [] }</pre>

After separating the search terms, it parses the inputArray for possible matches,
as in the following pseudo-code.
One important thing to notice is that during the <strong>preliminatory matching</strong> phase the matched terms are saved as keys with arrays as values where the matched json-properties get pushed as in:
<pre>var matchedAttrs = { or:{}, and:{}, not:{} }
where
or = {	"matched term string": [ "mathced json.property 1", "mathced json.property 2" ] }</pre>
This way the final <strong>record matching</strong> algorithm is <strong>TRIVIAL</strong> (especially the AND matching).
 
Pseudo-code:
	
	// store the matched records in an array
	var matchedRecords = [];
	
	for each inputObj in inputArray
		for each attr in inputObj
		
			/*
			 * if the attribute is on the "whitelist", do the term and record
			 * matching logic
			 */
			 
			if attributes.contains(attr)
				var matchedAttrs = { or:{}, and:{}, not:{} }
				
				/*
				 * all search terms ("or" and "and") are checked against all
				 * whitelisted attributes
				 */
				
				// OR term matches
				for each orTerm in splittedTerms.or
					if inputObj.attr.contains(orTerm)
						matchedAttrs.or.orTerm.push( attr )
					endif
				endfor	// OR matches
				
				// AND term matches
				for each andTerm in splittedTerms.and
					if inputObj.attr.contains(andTerm)
						matchedAttrs.and.andTerm.push( attr )
					endif
				endfor	// AND term matches
				
				// NOT term matches
				for each notTerm in splittedTerms.not
					if inputObj.attr.contains(notTerm)
						matchedAttrs.not.notTerm.push( attr )
					endif
				endfor	// NOT term matches
				
			endif // attribute whitelist
		endfor	// attr
		
		/*
		 * if there is(are) OR term(s), the matchedAttrs.or must not be empty,
		 * if there is(are) NOT term(s), the matchedAttrs.not must be empty,
		 * if there is(are) AND term(s), the matchedAttrs.and must not be empty
		 * and has to match the length of splittedTerms.and
		 */
		 
		// record matching
		
		/*
		 * now this is just a really simple explanation on how the matching 
		 * algorithm for each record works, please see full details in the 
		 * actual implementation...
		 */
		var matchType
		
		if splittedTerms.or.length > 0
			matchType.add(OR)
		if splittedTerms.and.length > 0
			matchType.add(AND)
		if splittedTerms.not.length > 0
			matchType.add(NOT)
		
		/*
		 * just the basic conditions are listed here, to see all the combinations
		 * please see the source file.
		 */
		switch matchType
			case OR
				if matchedAttrs.or.length > 0
					matched = true
				break
			case AND
				if matchedAttrs.and.length == splittedTerms.and.length
					matched = true
				break
			case NOT
				if matchedAttrs.not.length == 0
					matched = true
				break
		endswitch 
		
		if matched matchedRecords.push({
				record: inputObj,
				matches: matchedAttrs,
				weight: calculatedWeight(matchedAttrs) });
				
	endfor	// inputObj
	return matchedRecords

with the following assertion:
-	if there are no search terms, the records automatically match, eg. return
	all inputRecords as	matched.
	(This should not be the case, since the original script does not even call
	the searching function in case the input query equals "", @see original
	jsearch.html at line 6769).

For in-detail function of the searching and matching methods see the corresponding
methods in the CSC1903 class.
