import type { IUpdateInput } from "src/dynoexpr.d";

import {
	getExpressionAttributes,
	getUpdateExpression,
	isMathExpression,
	parseOperationValue,
} from "./update";

describe("update expression", () => {
	it.each(["foo + 2", "foo - 2", "2 - foo", "2 + foo", "foo  +  2", "foo+2"])(
		"parses the number on a math operation update: %s",
		(expr) => {
			const actual = parseOperationValue(expr, "foo");
			expect(actual).toBe(2);
		}
	);

	it("converts from an obj to ExpressionAttributes", () => {
		const Update = {
			foo: "bar",
			baz: 2,
			"foo-bar": "buz",
			fooBar: "buzz",
			"foo.bar": "quz",
			foo_bar: "qiz",
			FooBaz: null,
			quz: "if_not_exists(bazz)",
			Price: "if_not_exists(:p)",
		};
		const args = { Update };
		const actual = getExpressionAttributes(args);

		const expected = {
			Update,
			ExpressionAttributeNames: {
				"#n7b8f2f7a": "Price",
				"#n9efa7dcb": "quz",
				"#n5f0025bb": "foo",
				"#n22f4f0ae": "bar",
				"#n82504b33": "baz",
				"#n883b58ea": "foo-bar",
				"#n8af247c0": "fooBar",
				"#n851bf028": "foo_bar",
				"#n6dc4982e": "FooBaz",
			},
			ExpressionAttributeValues: {
				":v22f4f0ae": "bar",
				":vaeeabc63": 2,
				":vadc27efb": "buz",
				":v626130a1": "buzz",
				":p": ":p",
				":v42fa11db": "bazz",
				":v9efa7dcb": "quz",
				":v89dff0bd": null,
				":ve628f750": "qiz",
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("builds ExpressionAttributesMap with existing maps", () => {
		const Update = { a: 1 };
		const args = {
			Update,
			ExpressionAttributeNames: { "#b": "b" },
			ExpressionAttributeValues: { ":b": 2 },
		};
		const actual = getExpressionAttributes(args);

		const expected = {
			Update,
			ExpressionAttributeNames: { "#b": "b", "#na0f0d7ff": "a" },
			ExpressionAttributeValues: { ":b": 2, ":vc823bd86": 1 },
		};
		expect(actual).toStrictEqual(expected);
	});

	it("updates attributes - SET", () => {
		const args = {
			Update: {
				foo: "bar",
				baz: 2,
				buz: { biz: 3 },
				"foo.bar": 4,
				"foo.bar.baz": "buz",
				"foo.baz": null,
			},
		};
		const actual = getUpdateExpression(args);

		const expected = {
			UpdateExpression:
				"SET #n5f0025bb = :v22f4f0ae, #n82504b33 = :vaeeabc63, #nadc27efb = :v81f92362, #n5f0025bb.#n22f4f0ae = :vdd20580d, #n5f0025bb.#n22f4f0ae.#n82504b33 = :vadc27efb, #n5f0025bb.#n82504b33 = :v89dff0bd",
			ExpressionAttributeNames: {
				"#n5f0025bb": "foo",
				"#n22f4f0ae": "bar",
				"#n82504b33": "baz",
				"#nadc27efb": "buz",
			},
			ExpressionAttributeValues: {
				":v22f4f0ae": "bar",
				":vaeeabc63": 2,
				":v81f92362": { biz: 3 },
				":vdd20580d": 4,
				":vadc27efb": "buz",
				":v89dff0bd": null,
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	describe("if_not_exists", () => {
		it("update expression with if_not_exists", () => {
			const args = {
				Update: { foo: "if_not_exists(bar)" },
			};
			const actual = getUpdateExpression(args);

			const expected = {
				UpdateExpression:
					"SET #n5f0025bb = if_not_exists(#n5f0025bb, :v22f4f0ae)",
				ExpressionAttributeNames: { "#n5f0025bb": "foo" },
				ExpressionAttributeValues: { ":v22f4f0ae": "bar" },
			};
			expect(actual).toStrictEqual(expected);
		});
	});

	describe("list_append", () => {
		it("adds to the beginning of the list (numbers)", () => {
			const args = {
				Update: { foo: "list_append([1, 2], foo)" },
			};
			const actual = getUpdateExpression(args);

			const expected = {
				UpdateExpression:
					"SET #n5f0025bb = list_append(:v31e6eb45, #n5f0025bb)",
				ExpressionAttributeNames: { "#n5f0025bb": "foo" },
				ExpressionAttributeValues: { ":v31e6eb45": [1, 2] },
			};
			expect(actual).toStrictEqual(expected);
		});

		it("adds to the end of the list (numbers)", () => {
			const args = {
				Update: { foo: "list_append(foo, [1, 2])" },
			};
			const actual = getUpdateExpression(args);

			const expected = {
				UpdateExpression:
					"SET #n5f0025bb = list_append(#n5f0025bb, :v31e6eb45)",
				ExpressionAttributeNames: { "#n5f0025bb": "foo" },
				ExpressionAttributeValues: { ":v31e6eb45": [1, 2] },
			};
			expect(actual).toStrictEqual(expected);
		});

		it("adds to the beginning of the list (strings)", () => {
			const args = {
				Update: { foo: 'list_append(["buu", 2], foo)' },
			};
			const actual = getUpdateExpression(args);

			const expected = {
				UpdateExpression:
					"SET #n5f0025bb = list_append(:vc0126eec, #n5f0025bb)",
				ExpressionAttributeNames: { "#n5f0025bb": "foo" },
				ExpressionAttributeValues: { ":vc0126eec": ["buu", 2] },
			};
			expect(actual).toStrictEqual(expected);
		});

		it("adds to the end of the list (string)", () => {
			const args = {
				Update: { foo: 'list_append(foo, [1, "buu"])' },
			};
			const actual = getUpdateExpression(args);

			const expected = {
				UpdateExpression:
					"SET #n5f0025bb = list_append(#n5f0025bb, :va25015de)",
				ExpressionAttributeNames: { "#n5f0025bb": "foo" },
				ExpressionAttributeValues: { ":va25015de": [1, "buu"] },
			};
			expect(actual).toStrictEqual(expected);
		});
	});

	it.each([
		["foo", "foo - 2", true],
		["foo", "foo-2", true],
		["foo", "10-20-001", false],
		["foo", "foobar - 2", false],
		["foo", "2-foobar", false],
		["foo", "foo - bar", false],
		["foo", "Mon Jun 01 2020 20:54:50 GMT+0100 (British Summer Time)", false],
		["foo", "foo+bar@baz-buz.com", false],
		["foo", "http://baz-buz.com", false],
		["foo", null, false],
	])(
		"identifies an expression as being a math expression",
		(expr1, expr2, expected) => {
			const actual = isMathExpression(expr1, expr2);
			expect(actual).toStrictEqual(expected);
		}
	);

	it("updates numeric value math operations - SET", () => {
		const args: IUpdateInput = {
			Update: {
				foo: "foo - 2",
				bar: "2 - bar",
				baz: "baz + 9",
			},
		};
		const actual = getUpdateExpression(args);

		const expected = {
			UpdateExpression:
				"SET #n5f0025bb = #n5f0025bb - :vaeeabc63, #n22f4f0ae = :vaeeabc63 - #n22f4f0ae, #n82504b33 = #n82504b33 + :vf489a8ba",
			ExpressionAttributeNames: {
				"#n5f0025bb": "foo",
				"#n22f4f0ae": "bar",
				"#n82504b33": "baz",
			},
			ExpressionAttributeValues: {
				":vaeeabc63": 2,
				":vf489a8ba": 9,
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("updates expression with -/+ but it's not a math expression", () => {
		const args = {
			Update: {
				foo: "10-20-001",
				bar: "2020-06-01T19:53:52.457Z",
				baz: "Mon Jun 01 2020 20:54:50 GMT+0100 (British Summer Time)",
				buz: "foo+bar@baz-buz.com",
			},
		};
		const actual = getUpdateExpression(args);

		const expected = {
			UpdateExpression:
				"SET #n5f0025bb = :v82c546e8, #n22f4f0ae = :v21debd22, #n82504b33 = :vfe34ce2d, #nadc27efb = :vc048c69d",
			ExpressionAttributeNames: {
				"#n5f0025bb": "foo",
				"#n22f4f0ae": "bar",
				"#n82504b33": "baz",
				"#nadc27efb": "buz",
			},
			ExpressionAttributeValues: {
				":v82c546e8": "10-20-001",
				":v21debd22": "2020-06-01T19:53:52.457Z",
				":vfe34ce2d": "Mon Jun 01 2020 20:54:50 GMT+0100 (British Summer Time)",
				":vc048c69d": "foo+bar@baz-buz.com",
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("adds a number - ADD", () => {
		const args: IUpdateInput = {
			UpdateAction: "ADD",
			Update: {
				foo: 5,
			},
		};
		const actual = getUpdateExpression(args);

		const expected = {
			UpdateExpression: "ADD #n5f0025bb :v77e3e295",
			ExpressionAttributeNames: {
				"#n5f0025bb": "foo",
			},
			ExpressionAttributeValues: {
				":v77e3e295": 5,
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("adds elements to a set - SET", () => {
		const args: IUpdateInput = {
			UpdateAction: "ADD",
			Update: {
				foo: [1, 2],
				bar: ["bar", "baz"],
			},
		};
		const actual = getUpdateExpression(args);

		const expected = {
			UpdateExpression: "ADD #n5f0025bb :v101cd26b, #n22f4f0ae :vc0d39ad1",
			ExpressionAttributeNames: {
				"#n22f4f0ae": "bar",
				"#n5f0025bb": "foo",
			},
			ExpressionAttributeValues: {
				":vc0d39ad1": new Set(["bar", "baz"]),
				":v101cd26b": new Set([1, 2]),
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("removes element from a set - DELETE", () => {
		const args: IUpdateInput = {
			UpdateAction: "DELETE",
			Update: {
				foo: [1, 2],
				bar: ["bar", "baz"],
			},
		};
		const actual = getUpdateExpression(args);

		const expected = {
			UpdateExpression: "DELETE #n5f0025bb :v101cd26b, #n22f4f0ae :vc0d39ad1",
			ExpressionAttributeNames: {
				"#n22f4f0ae": "bar",
				"#n5f0025bb": "foo",
			},
			ExpressionAttributeValues: {
				":vc0d39ad1": new Set(["bar", "baz"]),
				":v101cd26b": new Set([1, 2]),
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
