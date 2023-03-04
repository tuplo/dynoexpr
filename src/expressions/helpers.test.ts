import {
	convertValue,
	buildConditionAttributeNames,
	buildConditionAttributeValues,
	buildConditionExpression,
	parseAttributeTypeValue,
	parseBeginsWithValue,
	parseBetweenValue,
	parseComparisonValue,
	parseContainsValue,
	parseInValue,
	parseNotCondition,
	parseSizeValue,
} from "./helpers";
import type {
	IConditionAttributeNamesParams,
	IConditionAttributeValuesParams,
} from "./helpers";

describe("helpers for condition helpers", () => {
	it.each([
		["foo", "foo"],
		["true", true],
		["false", false],
		["truest", "truest"],
		["falsest", "falsest"],
		["null", null],
		["123", 123],
		["2.5", 2.5],
		["123a", "123a"],
	])("converts from string to primitive values: %s", (value, expected) => {
		const actual = convertValue(value);
		expect(actual).toBe(expected);
	});

	describe("parse expression values", () => {
		it.each(["> 5", ">5", ">  5", ">=5", ">= 5", ">=  5"])(
			"comparison v: %s",
			(expr) => {
				const actual = parseComparisonValue(expr);
				expect(actual).toBe(5);
			}
		);

		it.each([
			"attribute_type(foo)",
			"attribute_type (foo)",
			"attribute_type  (foo)",
			"attribute_type( foo )",
		])("attribute_type(v): %s", (expr) => {
			const actual = parseAttributeTypeValue(expr);
			expect(actual).toBe("foo");
		});

		it.each([
			"begins_with(foo)",
			"begins_with  (foo)",
			"begins_with ( foo )",
			"BEGINS_WITH (foo)",
			"begins_with foo",
			"begins_with  foo",
		])("begins_with(v): %s", (expr) => {
			const actual = parseBeginsWithValue(expr);
			expect(actual).toBe("foo");
		});

		it.each(["between 1 and 2", "between  1  and   2"])(
			"between v1 and v2",
			(expr) => {
				const actual = parseBetweenValue(expr);
				expect(actual).toStrictEqual([1, 2]);
			}
		);

		it.each([
			"contains(foo)",
			"contains (foo)",
			"contains  (foo)",
			"contains( foo )",
			"CONTAINS(foo)",
		])("contains(v): %s", (expr) => {
			const actual = parseContainsValue(expr);
			expect(actual).toBe("foo");
		});

		it.each([
			["in(foo)", ["foo"]],
			["in (foo)", ["foo"]],
			["in  (foo)", ["foo"]],
			["in( foo )", ["foo"]],
			["in(foo,bar,baz)", ["foo", "bar", "baz"]],
			["in(foo, bar, baz)", ["foo", "bar", "baz"]],
			["in(foo,  bar,  baz)", ["foo", "bar", "baz"]],
		])("in(v1,v2,v3): %s", (expr, expected) => {
			const actual = parseInValue(expr);
			expect(actual).toStrictEqual(expected);
		});

		it.each([
			"size > 10",
			"size>10",
			"size >10",
			"size> 10",
			"SIZE>10",
			"size  >  10",
		])("size [op] v: %s", (expr) => {
			const actual = parseSizeValue(expr);
			expect(actual).toBe(10);
		});

		it.each([
			["not contains(foo)", "contains(foo)"],
			["not begins_with(foo)", "begins_with(foo)"],
			["not begins_with(1)", "begins_with(1)"],
		])("parse not conditions: %s", (expr, expected) => {
			const actual = parseNotCondition(expr);
			expect(actual).toBe(expected);
		});
	});

	describe("not expressions", () => {
		const Condition = {
			a: "not contains(foo)",
			b: "not begins_with(foo)",
			c: "not in(foo)",
		};

		it("builds not conditions (expression)", () => {
			const actual = buildConditionExpression({ Condition });

			const expected = [
				"not contains(#n69772661,:vccc4a4d8)",
				"not begins_with(#n7531578f,:vccc4a4d8)",
				"not #n408b5f33 in (:vccc4a4d8)",
			]
				.map((exp) => `(${exp})`)
				.join(" AND ");
			expect(actual).toStrictEqual(expected);
		});

		it("builds not conditions (values)", () => {
			const result = buildConditionAttributeValues(Condition);

			const expected = { ":vccc4a4d8": "foo" };
			expect(result).toStrictEqual(expected);
		});
	});

	describe("comparison operators", () => {
		const Condition = {
			a: "foo",
			b: "> 1",
			c: ">= 2",
			d: "< 3",
			e: "<= 4",
			f: "<> 5",
			g: "BETWEEN 6 AND 7",
			h: "IN (foo, bar)",
		};

		it("builds a condition expression", () => {
			const actual = buildConditionExpression({ Condition });

			const expected = [
				"#n69772661 = :vccc4a4d8",
				"#n7531578f > :v6f75849b",
				"#n408b5f33 >= :vcc14862c",
				"#n16e091ad < :vf2a7baf3",
				"#ne841ec32 <= :v7542122c",
				"#n1929cce7 <> :v74a318d5",
				"#n3614845d between :v7eb1b2dc and :v4bea2543",
				"#n3a695e91 in (:vccc4a4d8,:v4f2d51f2)",
			]
				.map((exp) => `(${exp})`)
				.join(" AND ");
			expect(actual).toStrictEqual(expected);
		});

		it("builds a condition expression with a specific logical operator", () => {
			const actual = buildConditionExpression({
				Condition,
				LogicalOperator: "OR",
			});

			const expected = [
				"#n69772661 = :vccc4a4d8",
				"#n7531578f > :v6f75849b",
				"#n408b5f33 >= :vcc14862c",
				"#n16e091ad < :vf2a7baf3",
				"#ne841ec32 <= :v7542122c",
				"#n1929cce7 <> :v74a318d5",
				"#n3614845d between :v7eb1b2dc and :v4bea2543",
				"#n3a695e91 in (:vccc4a4d8,:v4f2d51f2)",
			]
				.map((exp) => `(${exp})`)
				.join(" OR ");
			expect(actual).toStrictEqual(expected);
		});

		it("builds a condition expression with a list of expressions for the same field", () => {
			const actual = buildConditionExpression({
				Condition: {
					a: [
						"foo",
						"> 1",
						">= 2",
						"< 3",
						"<= 4",
						"<> 5",
						"BETWEEN 6 AND 7",
						"IN (foo, bar)",
					],
					b: "bar",
				},
				LogicalOperator: "OR",
			});

			const expected = [
				"#n69772661 = :vccc4a4d8",
				"#n69772661 > :v6f75849b",
				"#n69772661 >= :vcc14862c",
				"#n69772661 < :vf2a7baf3",
				"#n69772661 <= :v7542122c",
				"#n69772661 <> :v74a318d5",
				"#n69772661 between :v7eb1b2dc and :v4bea2543",
				"#n69772661 in (:vccc4a4d8,:v4f2d51f2)",
				"#n7531578f = :v4f2d51f2",
			]
				.map((exp) => `(${exp})`)
				.join(" OR ");
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributeNameMap", () => {
			const actual = buildConditionAttributeNames(Condition);

			const expected = {
				"#n69772661": "a",
				"#n7531578f": "b",
				"#n408b5f33": "c",
				"#n16e091ad": "d",
				"#ne841ec32": "e",
				"#n1929cce7": "f",
				"#n3614845d": "g",
				"#n3a695e91": "h",
			};
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributeNameMap with an existing map", () => {
			const Condition2 = { b: "foo" };
			const params: IConditionAttributeNamesParams = {
				ExpressionAttributeNames: { "#a": "a" },
			};
			const actual = buildConditionAttributeNames(Condition2, params);

			const expected = {
				"#a": "a",
				"#n7531578f": "b",
			};
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributesValueMap", () => {
			const actual = buildConditionAttributeValues(Condition);

			const expected = {
				":v4bea2543": 7,
				":v4f2d51f2": "bar",
				":v6f75849b": 1,
				":v74a318d5": 5,
				":v7542122c": 4,
				":v7eb1b2dc": 6,
				":vcc14862c": 2,
				":vccc4a4d8": "foo",
				":vf2a7baf3": 3,
			};
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributesValueMap with an existing map", () => {
			const Condition2 = { b: "foo" };
			const args: IConditionAttributeValuesParams = {
				ExpressionAttributeValues: { ":a": "bar" },
			};
			const actual = buildConditionAttributeValues(Condition2, args);

			const expected = {
				":a": "bar",
				":vccc4a4d8": "foo",
			};
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributesValueMap with multiple expressions for the same field", () => {
			const Condition2 = { b: ["foo", "attribute_exists"] };
			const result = buildConditionAttributeValues(Condition2);

			const expected = { ":vccc4a4d8": "foo" };
			expect(result).toStrictEqual(expected);
		});
	});

	describe("functions", () => {
		const Condition = {
			a: "attribute_exists",
			b: "attribute_not_exists",
			c: "attribute_type(S)",
			d: "begins_with(foo)",
			e: "contains(foo)",
			f: "size > 10",
			g: "attribute_exists ",
			h: " attribute_not_exists ",
		};

		it("builds a condition expression", () => {
			const actual = buildConditionExpression({ Condition });

			const expected = [
				"attribute_exists(#n69772661)",
				"attribute_not_exists(#n7531578f)",
				"attribute_type(#n408b5f33,:v1a47546e)",
				"begins_with(#n16e091ad,:vccc4a4d8)",
				"contains(#ne841ec32,:vccc4a4d8)",
				"size(#n1929cce7) > :vd163e820",
				"attribute_exists(#n3614845d)",
				"attribute_not_exists(#n3a695e91)",
			]
				.map((exp) => `(${exp})`)
				.join(" AND ");
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributeNameMap", () => {
			const actual = buildConditionAttributeNames(Condition);

			const expected = {
				"#n69772661": "a",
				"#n7531578f": "b",
				"#n3a695e91": "h",
				"#n408b5f33": "c",
				"#n3614845d": "g",
				"#n16e091ad": "d",
				"#ne841ec32": "e",
				"#n1929cce7": "f",
			};
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributesValueMap", () => {
			const actual = buildConditionAttributeValues(Condition);

			const expected = {
				":v1a47546e": "S",
				":vccc4a4d8": "foo",
				":vd163e820": 10,
			};
			expect(actual).toStrictEqual(expected);
		});
	});

	it("handles comparators look-a-likes", () => {
		const Condition = {
			a: "attribute_type_number",
			b: "begins_without",
			c: "inspector",
			d: "sizeable",
			e: "contains sugar",
			f: "attribute_exists_there",
			g: "attribute_not_exists_here",
		};
		const actual = {
			Expression: buildConditionExpression({ Condition }),
			ExpressionAttributeNames: buildConditionAttributeNames(Condition),
			ExpressionAttributeValues: buildConditionAttributeValues(Condition),
		};

		const expected = {
			Expression: [
				"#n69772661 = :v349ead1e",
				"#n7531578f = :v9248d2e5",
				"#n408b5f33 = :v61b10428",
				"#n16e091ad = :vf627322b",
				"#ne841ec32 = :v49469c1a",
				"#n1929cce7 = :v6cbed5d5",
				"#n3614845d = :v07df4118",
			]
				.map((exp) => `(${exp})`)
				.join(" AND "),
			ExpressionAttributeNames: {
				"#n69772661": "a",
				"#n7531578f": "b",
				"#n408b5f33": "c",
				"#n16e091ad": "d",
				"#n3614845d": "g",
				"#n1929cce7": "f",
				"#ne841ec32": "e",
			},
			ExpressionAttributeValues: {
				":v07df4118": "attribute_not_exists_here",
				":v349ead1e": "attribute_type_number",
				":v49469c1a": "contains sugar",
				":v61b10428": "inspector",
				":v6cbed5d5": "attribute_exists_there",
				":v9248d2e5": "begins_without",
				":vf627322b": "sizeable",
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
