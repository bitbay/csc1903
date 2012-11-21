# Description

This is a demo page (Main) for the "JSON Search UI with JavaScript" CloudSpokes Challenge (CSC1903).
The page uses some mockup json data defined in javascript, allowing the user to query results from this dataset. The query can be filtered for specific properties of the objects in the dataset controlled by some checkboxes. The query string itself may contain the following control commands:

* <strong>OR</strong> term, example query 'Macao green'
* <strong>AND</strong> term, example query 'Macao +green'
* <strong>NOT</strong> term, example query 'Macao -indigo'
* any of these mixed, example query 'Macao -9 +green +indigo'

The results obtained by the CSC1903.search method are returned as a "weight-sorted" array, where the "weight" of each result depends on the number of occurrence of the matching search terms. Best match is the result with the most weight.

Classes are tested with [Jasmine](http://pivotal.github.com/jasmine/), source for test classes can be found inside the folder <strong>./spec</strong>.

## Class usage

To get the results from an array of Objects, call the CSC1903.search public method of the class. The methods signature is
<code>CSC1903.search(searchTerm, inputArray, attributes)</code>
About details of the calling arguments, please read the function description inside the class.

# Installation / deployment

## Setting up project folder

Create a folder in Your workspace:
<pre>$ cd ~/workspace
$ mkdir csc1903</pre>

## Getting source

Unpack the submitted zip archive:
<pre>csc1903$ unzip csc1903.zip</pre>
	
or alternatively get source from git:
<pre>$ git clone https://github.com/bitbay/csc1884.git</pre>

## Configuration

The only configuration is located in the <strong>CSC1903.js</strong> file, inside the Logger class - DEBUG. This controls whether the application should log it's progress to the the console or not.

## Compiling the application

The application runs inside a browser, there is no need to compile any part of it - no ANT build script included for the very same reason.

## Running the application

Open up the <strong>./Jsearch.html</strong> in a web browser to run the application.

## Running tests

To run the Jasmin specs included, open the <strong>./SpecRunner.html</strong> in a web browser. You should see the results.

# Application Internals

## HTML page

Some modifications done to the original html:
* the results are passed around as argument to the following functions:
		showResults(results)
		createTable(results)
* generally, checkbox inputs in html should have their value property set. In this case these value properties should match the attribute field names in the to-be-checked objects. (as in <input type="checkbox" value="color"> would correspond to {color:""}) These could be interpreted as "hard-coded" constants/values...

More inplementation changes are done inside the function searchclick(). Please read the comments/annotations inside that function for details.

## CSC1903 class

The search function basically does two things: splits the search term into OR and
AND chunks, saving them in a splittedTerms object with these two properties.
	var splittedTerms = { or: [], and: [] }

After separating the search terms, it parses the inputArray for possible matches,
as in this pseudo-code:
	
	// store the matched records in an array
	var matchedRecords = [];
	
	for each inputObj in inputArray
		for each attr in inputObj
		
			/*
			 * if the attribute is on the "whitelist", do the term and record
			 * matching logic
			 */
			 
			if attributes.contains(attr)
				var matchedAttrs = { or:{}, and:{} }
				
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
		
		switch matchType
			case OR
				if matchedAttrs.or > 0
					matched = true
				break
			case AND
				if matchedAttrs.and == splittedTerms.and
					matched = true
				break
			case NOT
				if matchedAttrs.not == 0
					matched = true
				break
		endswitch 
		
		if matched matchedRecords.push({
				record: inputObj,
				matches: matchedAttrs,
				weight: calculatedWeight(matchedAttrs) });
				
	endfor	// inputObj
	return matchedRecords

with the following conditional logic:
-	if there are no search terms, the records automatically match, eg. return
	all inputRecords as	matched.
	(This should not be the case, since the original script does not even call
	the searching function in case the input query equals "", @see original
	jsearch.html at line 6769).

For in-detail function of the searching and matching methods see the corresponding
methods in the CSC1903 class.
