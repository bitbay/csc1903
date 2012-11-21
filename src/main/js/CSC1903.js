/**
 * Cloudspokes challenge #1903 - JSON Search UI with JavaScript
 * 
 * CSC1903.js - Main class (CSC1903), Logger helper class (Logger)
 *
 * Features:
 *	- search terms of type OR, AND (+), NOT (-)
 * 	- weighted ordering search results
 *
 * @author	daniel@bitbay.org
 * @version 1.0.1
 */

// ==ClosureCompiler==
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/jquery-1.6.js
// ==/ClosureCompiler==

/**
 * The main class.
 *
 * Only dependency is jQuery.
 */
var CSC1903 = (function($) {
	/* PRIVATE METHODS */
	
	/**
	 * Trims whitespace from start and beginning of string
	 *
	 * @param {string} str	input to trim
	 * @return {string}	trimmed string
	 *
	 * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript
	 */
	function trim(str) {
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}
	
	/**
	 * Returns the number of own properties of an Object
	 *
	 * @param {Object} obj	the object to count own properties of
	 * @return {number}	the own properties found in the object
	 */
	function countOwnProps(obj) {
		var count = 0;
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				++count;
			}
		}
		
		return count;
	}
	
	/**
	 * Splits the terms into an object used by the class
	 * 
	 * @param {string} searchTerm	the original string
	 * @return {Object}	the splittedTerms object
	 */
	function splitSearchTerm(searchTerm) {
		// the terms that should filter the input.
		var splittedTerms = { or:[], and:[], not:[] };
		
		/*
		 * regular expression
		 *	(
		 *	[\+|-]?\s*"[^"]+"
		 *	|
		 *	[\+|-]?\s?\w+
		 *	)\s*
		 *
		 *	meaning
		 *	(
		 *		match possible + and - with/without whitespace between symbol
		 *		and double quote, followed by any number of characters the fisrt
		 *		of them not being " until next double quote
		 *
		 *	|
		 *		match words preceded by possible + and - signs followed by(or not)
		 *		whitespace characters
		 *	)	wraped in a group
		 *	\s*	swallow trailing whitespace
		 */
		var terms = searchTerm.split(/([\+|-]?\s*"[^"]+"|[\+|-]?\s?\w+)\s*/ig);
	
		for (var i=0; i<terms.length; ++i) {
			var term = terms[i];
  			if(term.length > 0) {
  				switch( term[0] ){
  					case '+' :
  						// it's an AND term
  						// remove + and " signs, trim whitespaces
  						term = trim(term.replace(/["\+]/g,''));
  						splittedTerms.and.push(term);
  						Logger.log("and rule:" + term);
  						break;
  					case '-' :
  						// it's a NOT term
  						// remove - and " signs, trim whitespaces
  						term = trim(term.replace(/["-]/g,''));
  						splittedTerms.not.push(term);
  						Logger.log("not rule:" + term);
  						break;
  					default :
  						// it's an OR term
  						// remove " signs, trim whitespaces
  						term = trim(term.replace(/"/g,''));
  						splittedTerms.or.push(term);
  						Logger.log("or rule:" + term);
  						break;
  				}
  			}
		}
		
		return splittedTerms;
	};
	
	/**
	 * Matches terms in object attributes
	 *
	 * @param {Object} splittedTerms	object with normalized AND and OR terms 
	 * @param {Array.<Object>} inputArray	array of records to filter
	 * @param {Array.<string>} attributes	array of attributes to match against
	 *
	 * @return {Array.<Object>} records matching the query.
	 */
	function matchTerms (splittedTerms, inputArray, attributes) {
		// store the matched records in an array
		var matchedRecords = [];
		
		// for each object in input
		var inputObj;
		for (inputObj in inputArray) {
			/*
			 * each property (or, and, not) will hold a sort-of-a "dictionary"
			 * reference to the terms encountered, which in turn will hold an
			 * array of the attributes the term was found in.
			 */
			var matchedAttrs = { or:{}, and:{}, not:{} };
			
			// for each of the objects attribute
			var attr;
			for (attr in inputArray[inputObj]) {
			
				// attribute "whitelist" check
				if ($.inArray(attr, attributes) != -1) {
					
					/*
					 * all search terms ("or" and "and") are checked against all
					 * whitelisted attributes
					 */
					
					var term;
					
					// OR term matches
					for (term in splittedTerms.or) {
						var orTerm = splittedTerms.or[term];
						
						// check if term matches attribute value
						if (inputArray[inputObj][attr].indexOf(orTerm) != -1) {
							if(matchedAttrs.or.hasOwnProperty(orTerm)) {
								// was found before, append to the array
								matchedAttrs.or[orTerm].push(attr);
							} else {
								// first match, create new array
								matchedAttrs.or[orTerm] = [ attr ];
							}
							
						}
					}
				
					// AND term matches
					for (term in splittedTerms.and) {
						var andTerm = splittedTerms.and[term];
						
						// check if term matches attribute value
						if (inputArray[inputObj][attr].indexOf(andTerm) != -1) {
							if(matchedAttrs.and.hasOwnProperty(andTerm)) {
								// was found before, append to the array
								matchedAttrs.and[andTerm].push(attr);
							} else {
								// first match, create new array
								matchedAttrs.and[andTerm] = [ attr ];
							}
						}
					}
					
					// NOT term matches
					for (term in splittedTerms.not) {
						var notTerm = splittedTerms.not[term];
						
						// check if term matches attribute value
						if (inputArray[inputObj][attr].indexOf(notTerm) != -1) {
							if(matchedAttrs.not.hasOwnProperty(notTerm)) {
								// was found before, append to the array
								matchedAttrs.not[notTerm].push(attr);
							} else {
								// first match, create new array
								matchedAttrs.not[notTerm] = [ attr ];
							}
						}
					}
				}
			}
			
			/* RECORD MATCHING */
			
			// flag of type int for deciding what to check as match skip if/else
			// horror
			var typeIndex = 0;
			
			if (splittedTerms.or.length > 0)	typeIndex += 1;
			if (splittedTerms.and.length > 0)	typeIndex += 2;
			if (splittedTerms.not.length > 0)	typeIndex += 4;
			
			var matched = false;
			
			switch( typeIndex ) {
				case 0 :
					// no match criterias, match all
					matched = true;
					break;
				case 1 :
					// match OR
					if(countOwnProps(matchedAttrs.or) > 0)
						matched = true;
					break;
				case 2 :
					// match AND
					if(countOwnProps(matchedAttrs.and) == splittedTerms.and.length)
						matched = true;
					break;
				case 3 :
					// match OR && AND
					if(countOwnProps(matchedAttrs.or) > 0 &&
						countOwnProps(matchedAttrs.and) == splittedTerms.and.length)
						matched = true;
					break;
				case 4 :
					// match NOT
					if(countOwnProps(matchedAttrs.not) == 0)
						matched = true;
					break;
				case 5 :
					// match OR && NOT
					if(countOwnProps(matchedAttrs.or) > 0 &&
						countOwnProps(matchedAttrs.not) == 0)
						matched = true;
					break;
				case 6 :
					// match AND && NOT
					if(countOwnProps(matchedAttrs.not) == 0 &&
						countOwnProps(matchedAttrs.and) == splittedTerms.and.length)
						matched = true;
					break;
				default :
					// match OR && AND && NOT
					if( countOwnProps(matchedAttrs.or) > 0 &&
						countOwnProps(matchedAttrs.not) == 0 &&
						countOwnProps(matchedAttrs.and) == splittedTerms.and.length)
						matched = true;
					break;
			}

			if (matched) matchedRecords.push({
				record: inputArray[inputObj],
				matches: matchedAttrs,
				weight: calculateWeight(matchedAttrs) });
		}
		
		return matchedRecords;
	}
	
	/**
	 * Sorts results by terms weight (number of times found)
	 *
	 * @param {Object} a	result
	 * @param {Object} b	result
	 * @return {number} -1 || 0 || 1
	 */
	function order (a, b) {
		return b.weight-a.weight;
	}
	
	/**
	 * Calculates "weight" in term of search terms, number of times terms
	 * appeared in the object attribute values.
	 *
	 * @param {Object} result	the matches object to calculate the weight of
	 * @return {number} numerical "weight" of search terms
	 */
	function calculateWeight (result) {
		var weight = 0;
		var prop;
		
		// OR matches
		for( prop in result.or ) {
			weight += result.or[prop].length;
		}
		
		// AND matches
		for( prop in result.and ) {
			weight += result.and[prop].length;
		}
		
		// NOT matches do not add to the weight, since they exclude results...
		
		return weight;
	}
	
	/* PUBLIC METHODS */
	
	/**
	 * Search - main function
	 * 
	 * @param {string} searchTerm	search term to match records against
	 * @param {Array.<Object>} inputArray	array of records to filter
	 * @param {Array.<string>} attributes	array of attributes to match against
	 *
	 * @return {Array.<Object>} records matching the query.
	 */
	function search(searchTerm, inputArray, attributes) {
		// split terms
		var splittedTerms = splitSearchTerm(searchTerm);
		
		// match results
		var results = matchTerms(splittedTerms, inputArray, attributes);
		
		// order results
		results.sort(order);
		
		return results;
	};
	
	/* Public methods exposed for CSC1903 */
	/** @return {Object.<string, function()>} */
	return {
		search : search,
		// the following are exposed as public just for unit testing
		calculateWeight: calculateWeight,
		matchTerms: matchTerms,
		splitSearchTerm: splitSearchTerm,
		order: order,
		trim: trim,
		countOwnProps: countOwnProps
	};
})(window.jQuery);

/**
 * Logger
 *
 * System-wide message handler - not to be included in production environment
 */
var Logger = (function() {
	// only prints to console if this is set to true
	var DEBUG = false;
	
	/**
	 * Avoid `console` errors in browsers that lack a console.
	 *
	 * @see HTML Boilerplate
	 */
	var noop = function noop() {};
	var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml',
		'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info',
		'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time',
		'timeEnd', 'timeStamp', 'trace', 'warn'];
	var length = methods.length;
	var console = window.console || {};
	while (length--) {
		// Only stub undefined methods.
		console[methods[length]] = console[methods[length]] || noop;
	}
	
	/* Public methods exposed for Logger */
	return {
		log: function(msg) { if(DEBUG) console.log(msg); }
	};
})();

