describe("CSC1903", function() {
	var jdata;
	var query;
	var attributes;
	var splittedTerms;
	var results;
	
	beforeEach(function() {
		jdata = [
			{
				"name": "Mauritius",
				"description": "Ap #382-7722 Sem. Road",
				"tags": "ten, two, five, one, four",
				"color": "green",
				"number": "3"
			},
			{
				"name": "Macao",
				"description": "4431 Vel, Avenue",
				"color": "indigo, green",
				"number": "9"
			},
			{
				"name": "Macao",
				"description": "4431 Vel, Avenue",
				"color": "indigo, velvet",
				"number": "9"
			}
		];
		query = 'Macao 9 +green -velvet "Ap #382-772"';
		attributes = [ "name", "description", "color", "number" ];
	});
	
	/**
	 * Testing CSC1903.splitSearchTerm()
	 */
	it("should be able to parse a string of search terms", function() {
		var result = CSC1903.splitSearchTerm(query);
		
		expect(result.and.length).toEqual(1);
		expect(result.not.length).toEqual(1);
		expect(result.or.length).toEqual(3);

		expect(result.and).toContain("green");
		expect(result.not).toContain("velvet");
		expect(result.or).toContain("Macao");
		expect(result.or).toContain("9");
		expect(result.or).toContain("Ap #382-772");
	});
	
	/**
	 * Testing CSC1903.matchTerms()
	 */
	describe("while searching for results inside an array", function() {
		beforeEach(function() {
			splittedTerms = CSC1903.splitSearchTerm(query);
			results = CSC1903.matchTerms(splittedTerms, jdata, attributes);
		});
		
		/**
		 * Testing results.matches
		 */
		it("result should contain matches", function() {
			expect(results.length).toEqual(2);
			expect(results[0].matches).toBeDefined();
			expect(results[0].matches.and).toBeDefined();
			expect(results[0].matches.or).toBeDefined();
			expect(results[0].matches.not).toBeDefined();
			expect(results[0].matches.and["green"]).toBeDefined();
			expect(results[0].matches.and["green"].length).toEqual(1);
		});
		
		/**
		 * Testing results.record
		 */
		it("result should contain record", function() {
			expect(results[0].record).toBeDefined();
			expect(results[0].record).toEqual(jdata[0]);
		});
		
		/**
		 * Testing results.weight
		 */
		it("result should contain weight", function() {
			expect(results[0].weight).toBeDefined();
			expect(results[0].weight).toEqual(2);
		});
		
		/**
		 * Testing CSC1903.order
		 */
		it("should be able to order results by their weight", function() {
			results.sort(CSC1903.order);
			expect(results[0].record).toEqual(jdata[1]);
		});
	});
	
	/**
	 * Testing helper functions
	 */
	describe("helper functions used in the class", function() {
		/**
		 * Testing trim function
		 */
		it("should trim spaces before and after a text in a string", function(){
			var string = CSC1903.trim("   text  ");
			expect(string).toEqual("text");
		});
		
		/**
		 * Testing countOwnProps
		 */
		it("should return the number of own properties of an object", function(){
			var obj = new Object();
			obj.property = "property";
			obj.another = "another";
			
			var num = CSC1903.countOwnProps(obj);
			expect(num).toEqual(2);
		});
	});
});
