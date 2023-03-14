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
				"not contains(#na0f0d7ff,:v5f0025bb)",
				"not begins_with(#ne4645342,:v5f0025bb)",
				"not #n54601b21 in (:v5f0025bb)",
			]
				.map((exp) => `(${exp})`)
				.join(" AND ");
			expect(actual).toStrictEqual(expected);
		});

		it("builds not conditions (values)", () => {
			const result = buildConditionAttributeValues(Condition);

			const expected = { ":v5f0025bb": "foo" };
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
				"#na0f0d7ff = :v5f0025bb",
				"#ne4645342 > :vc823bd86",
				"#n54601b21 >= :vaeeabc63",
				"#nae599c14 < :vf13631fc",
				"#n7c866780 <= :vdd20580d",
				"#n79761749 <> :v77e3e295",
				"#n42f580fe between :vde135ba3 and :v11392247",
				"#ne38a286c in (:v5f0025bb,:v22f4f0ae)",
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
				"#na0f0d7ff = :v5f0025bb",
				"#ne4645342 > :vc823bd86",
				"#n54601b21 >= :vaeeabc63",
				"#nae599c14 < :vf13631fc",
				"#n7c866780 <= :vdd20580d",
				"#n79761749 <> :v77e3e295",
				"#n42f580fe between :vde135ba3 and :v11392247",
				"#ne38a286c in (:v5f0025bb,:v22f4f0ae)",
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
				"#na0f0d7ff = :v5f0025bb",
				"#na0f0d7ff > :vc823bd86",
				"#na0f0d7ff >= :vaeeabc63",
				"#na0f0d7ff < :vf13631fc",
				"#na0f0d7ff <= :vdd20580d",
				"#na0f0d7ff <> :v77e3e295",
				"#na0f0d7ff between :vde135ba3 and :v11392247",
				"#na0f0d7ff in (:v5f0025bb,:v22f4f0ae)",
				"#ne4645342 = :v22f4f0ae",
			]
				.map((exp) => `(${exp})`)
				.join(" OR ");
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributeNameMap", () => {
			const actual = buildConditionAttributeNames(Condition);

			const expected = {
				"#na0f0d7ff": "a",
				"#ne4645342": "b",
				"#n54601b21": "c",
				"#nae599c14": "d",
				"#n7c866780": "e",
				"#n79761749": "f",
				"#n42f580fe": "g",
				"#ne38a286c": "h",
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
				"#ne4645342": "b",
			};
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributesValueMap", () => {
			const actual = buildConditionAttributeValues(Condition);

			const expected = {
				":v11392247": 7,
				":v22f4f0ae": "bar",
				":vc823bd86": 1,
				":v77e3e295": 5,
				":vdd20580d": 4,
				":vde135ba3": 6,
				":vaeeabc63": 2,
				":v5f0025bb": "foo",
				":vf13631fc": 3,
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
				":v5f0025bb": "foo",
			};
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributesValueMap with multiple expressions for the same field", () => {
			const Condition2 = { b: ["foo", "attribute_exists"] };
			const result = buildConditionAttributeValues(Condition2);

			const expected = { ":v5f0025bb": "foo" };
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
				"attribute_exists(#na0f0d7ff)",
				"attribute_not_exists(#ne4645342)",
				"attribute_type(#n54601b21,:va6a17c2f)",
				"begins_with(#nae599c14,:v5f0025bb)",
				"contains(#n7c866780,:v5f0025bb)",
				"size(#n79761749) > :va8d1f941",
				"attribute_exists(#n42f580fe)",
				"attribute_not_exists(#ne38a286c)",
			]
				.map((exp) => `(${exp})`)
				.join(" AND ");
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributeNameMap", () => {
			const actual = buildConditionAttributeNames(Condition);

			const expected = {
				"#na0f0d7ff": "a",
				"#ne4645342": "b",
				"#ne38a286c": "h",
				"#n54601b21": "c",
				"#n42f580fe": "g",
				"#nae599c14": "d",
				"#n7c866780": "e",
				"#n79761749": "f",
			};
			expect(actual).toStrictEqual(expected);
		});

		it("builds the ExpressionAttributesValueMap", () => {
			const actual = buildConditionAttributeValues(Condition);

			const expected = {
				":va6a17c2f": "S",
				":v5f0025bb": "foo",
				":va8d1f941": 10,
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
				"#na0f0d7ff = :vc808d243",
				"#ne4645342 = :v87d9643e",
				"#n54601b21 = :vabb6174f",
				"#nae599c14 = :v1a831753",
				"#n7c866780 = :v41393c38",
				"#n79761749 = :va76dd02b",
				"#n42f580fe = :v700afe17",
			]
				.map((exp) => `(${exp})`)
				.join(" AND "),
			ExpressionAttributeNames: {
				"#na0f0d7ff": "a",
				"#ne4645342": "b",
				"#n54601b21": "c",
				"#nae599c14": "d",
				"#n42f580fe": "g",
				"#n79761749": "f",
				"#n7c866780": "e",
			},
			ExpressionAttributeValues: {
				":v700afe17": "attribute_not_exists_here",
				":vc808d243": "attribute_type_number",
				":v41393c38": "contains sugar",
				":vabb6174f": "inspector",
				":va76dd02b": "attribute_exists_there",
				":v87d9643e": "begins_without",
				":v1a831753": "sizeable",
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
