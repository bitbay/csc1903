Some modifications done to the original html:
-	the results are passed around as argument to the following functions:
		showResults(results)
		createTable(results)
-	generally, checkbox inputs in html should have their value property set. In
	this case these value properties should match the attribute field names in
	the to-be-checked objects.
	(as in <input type="checkbox" value="color"> would correspond to {color:""})
	These could be interpreted as "hard-coded" constants/values...

The more concrete inplementation changes done inside the function searchclick().
Please read the comments/annotations inside that function for details.

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
		if splittedTerms.or.length > 0 && splittedTerms.and.length > 0
			if matchedAttrs.or.length > 0 && matchedTerms.and.length > 0
					matchedRecords.push( { 	record:inputObj,
											matches:matchedAttrs })
			endif
		else if splittedTerms.or.length > 0
			if matchedAttrs.or.length > 0
				matchedRecords.push( { 	record:inputObj,
										matches:matchedAttrs })
			endif
		else if splittedTerms.and.length > 0
			if matchedTerms.and.length > 0
					matchedRecords.push( { 	record:inputObj,
											matches:matchedAttrs })
			endif
		else
			// empty search term
		endif	// record matching
	endfor	// inputObj
	return matchedRecords
	
with the following conditional logic:
-	if there are no search terms, the records automatically match, eg. return
	all inputRecords as	matched.
	(This should not be the case, since the original script does not even call
	the searching function in case the input query equals "", @see original
	jsearch.html at line 6769).

For in-detail function of the 
