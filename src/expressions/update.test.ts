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
				"#n0a7f0118": "Price",
				"#n491011cd": "quz",
				"#nccc4a4d8": "foo",
				"#n4f2d51f2": "bar",
				"#nc85f6e88": "baz",
				"#n002f9cb1": "foo-bar",
				"#nb1085dc0": "fooBar",
				"#n87565a6e": "foo_bar",
				"#n77caf26a": "FooBaz",
			},
			ExpressionAttributeValues: {
				":v4f2d51f2": "bar",
				":vcc14862c": 2,
				":v842166e7": "buz",
				":v6864fef0": "buzz",
				":p": ":p",
				":v08990c65": "bazz",
				":v491011cd": "quz",
				":v89dff0bd": null,
				":vf7b0c4ab": "qiz",
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
			ExpressionAttributeNames: { "#b": "b", "#n69772661": "a" },
			ExpressionAttributeValues: { ":b": 2, ":v6f75849b": 1 },
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
				"SET #nccc4a4d8 = :v4f2d51f2, #nc85f6e88 = :vcc14862c, #n842166e7 = :v81f92362, #nccc4a4d8.#n4f2d51f2 = :v7542122c, #nccc4a4d8.#n4f2d51f2.#nc85f6e88 = :v842166e7, #nccc4a4d8.#nc85f6e88 = :v89dff0bd",
			ExpressionAttributeNames: {
				"#nccc4a4d8": "foo",
				"#n4f2d51f2": "bar",
				"#nc85f6e88": "baz",
				"#n842166e7": "buz",
			},
			ExpressionAttributeValues: {
				":v4f2d51f2": "bar",
				":vcc14862c": 2,
				":v81f92362": { biz: 3 },
				":v7542122c": 4,
				":v842166e7": "buz",
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
					"SET #nccc4a4d8 = if_not_exists(#nccc4a4d8, :v4f2d51f2)",
				ExpressionAttributeNames: { "#nccc4a4d8": "foo" },
				ExpressionAttributeValues: { ":v4f2d51f2": "bar" },
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
					"SET #nccc4a4d8 = list_append(:v31e6eb45, #nccc4a4d8)",
				ExpressionAttributeNames: { "#nccc4a4d8": "foo" },
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
					"SET #nccc4a4d8 = list_append(#nccc4a4d8, :v31e6eb45)",
				ExpressionAttributeNames: { "#nccc4a4d8": "foo" },
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
					"SET #nccc4a4d8 = list_append(:vc0126eec, #nccc4a4d8)",
				ExpressionAttributeNames: { "#nccc4a4d8": "foo" },
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
					"SET #nccc4a4d8 = list_append(#nccc4a4d8, :va25015de)",
				ExpressionAttributeNames: { "#nccc4a4d8": "foo" },
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
				"SET #nccc4a4d8 = #nccc4a4d8 - :vcc14862c, #n4f2d51f2 = :vcc14862c - #n4f2d51f2, #nc85f6e88 = #nc85f6e88 + :vc7c6ad26",
			ExpressionAttributeNames: {
				"#nccc4a4d8": "foo",
				"#n4f2d51f2": "bar",
				"#nc85f6e88": "baz",
			},
			ExpressionAttributeValues: {
				":vcc14862c": 2,
				":vc7c6ad26": 9,
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
				"SET #nccc4a4d8 = :v93d9c40c, #n4f2d51f2 = :v889c4416, #nc85f6e88 = :vb8b5deb4, #n842166e7 = :vb73f14ee",
			ExpressionAttributeNames: {
				"#nccc4a4d8": "foo",
				"#n4f2d51f2": "bar",
				"#nc85f6e88": "baz",
				"#n842166e7": "buz",
			},
			ExpressionAttributeValues: {
				":v93d9c40c": "10-20-001",
				":v889c4416": "2020-06-01T19:53:52.457Z",
				":vb8b5deb4": "Mon Jun 01 2020 20:54:50 GMT+0100 (British Summer Time)",
				":vb73f14ee": "foo+bar@baz-buz.com",
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
			UpdateExpression: "ADD #nccc4a4d8 :v74a318d5",
			ExpressionAttributeNames: {
				"#nccc4a4d8": "foo",
			},
			ExpressionAttributeValues: {
				":v74a318d5": 5,
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
			UpdateExpression: "ADD #nccc4a4d8 :v101cd26b, #n4f2d51f2 :vc0d39ad1",
			ExpressionAttributeNames: {
				"#n4f2d51f2": "bar",
				"#nccc4a4d8": "foo",
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
			UpdateExpression: "DELETE #nccc4a4d8 :v101cd26b, #n4f2d51f2 :vc0d39ad1",
			ExpressionAttributeNames: {
				"#n4f2d51f2": "bar",
				"#nccc4a4d8": "foo",
			},
			ExpressionAttributeValues: {
				":vc0d39ad1": new Set(["bar", "baz"]),
				":v101cd26b": new Set([1, 2]),
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
