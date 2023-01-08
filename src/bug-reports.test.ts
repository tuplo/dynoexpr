import dynoexpr from "./index";
import type { FilterInput } from "./dynoexpr.d";

describe("bug reports", () => {
	it("logical operator", () => {
		const dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(1646249594000);
		const args = {
			Update: {
				modified: new Date(Date.now()).toJSON(),
				GSI1_PK: "OPEN",
				GSI2_PK: "REQUEST#STATUS#open#DATE#2022-03-01T13:58:09.242z",
			},
			Condition: {
				status: ["IN_PROGRESS", "OPEN"],
			},
			ConditionLogicalOperator: "OR",
		};
		const result = dynoexpr(args);

		const expected = {
			ConditionExpression:
				"(#n44ec6258 = :va87bccc9) OR (#n44ec6258 = :v5ebbf5c3)",
			ExpressionAttributeNames: {
				"#n4b532461": "GSI1_PK",
				"#n44ec6258": "status",
				"#n4a4b98d5": "modified",
				"#nfbaeecf8": "GSI2_PK",
			},
			ExpressionAttributeValues: {
				":vd8444872": "2022-03-02T19:33:14.000Z",
				":v879a6e2b": "REQUEST#STATUS#open#DATE#2022-03-01T13:58:09.242z",
				":va87bccc9": "IN_PROGRESS",
				":v5ebbf5c3": "OPEN",
			},
			UpdateExpression:
				"SET #n4a4b98d5 = :vd8444872, #n4b532461 = :v5ebbf5c3, #nfbaeecf8 = :v879a6e2b",
		};
		expect(result).toStrictEqual(expected);

		dateNowSpy.mockRestore();
	});

	it("supports if_not_exists on update expressions", () => {
		const result = dynoexpr({
			Update: { number: "if_not_exists(420)" },
		});

		const expected = {
			UpdateExpression:
				"SET #ne68615df = if_not_exists(#ne68615df, :v24592772)",
			ExpressionAttributeNames: { "#ne68615df": "number" },
			ExpressionAttributeValues: { ":v24592772": "420" },
		};
		expect(result).toStrictEqual(expected);
	});

	it("allows boolean values", () => {
		const Filter = {
			a: "<> true",
			b: "<> false",
		};
		const params: FilterInput = { Filter };
		const actual = dynoexpr(params);

		const expected = {
			ExpressionAttributeNames: { "#n69772661": "a", "#n7531578f": "b" },
			ExpressionAttributeValues: { ":v05902327": false, ":v7534cb09": true },
			FilterExpression:
				"(#n69772661 <> :v7534cb09) AND (#n7531578f <> :v05902327)",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("empty ExpressionAttributeValues on UpdateRemove with Condition", () => {
		const params = {
			UpdateRemove: { "parent.item": 1 },
			Condition: { "parent.item": "attribute_exists" },
		};
		const actual = dynoexpr(params);

		const expected = {
			ConditionExpression: "(attribute_exists(#n7e86b602.#n95d67ebc))",
			ExpressionAttributeNames: {
				"#n95d67ebc": "item",
				"#n7e86b602": "parent",
			},
			UpdateExpression: "REMOVE #n7e86b602.#n95d67ebc",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("pass undefined to UpdateRemove", () => {
		const params = {
			UpdateRemove: { "parent.item": undefined },
			Condition: { "parent.item": "attribute_exists" },
		};
		const actual = dynoexpr(params);

		const expected = {
			ConditionExpression: "(attribute_exists(#n7e86b602.#n95d67ebc))",
			ExpressionAttributeNames: {
				"#n95d67ebc": "item",
				"#n7e86b602": "parent",
			},
			UpdateExpression: "REMOVE #n7e86b602.#n95d67ebc",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("handles list_append", () => {
		const params = {
			Update: { numbersArray: "list_append([1, 2], numbersArray)" },
		};
		const actual = dynoexpr(params);

		const expected = {
			UpdateExpression: "SET #n596ceb9c = list_append(:v31e6eb45, #n596ceb9c)",
			ExpressionAttributeNames: { "#n596ceb9c": "numbersArray" },
			ExpressionAttributeValues: { ":v31e6eb45": [1, 2] },
		};
		expect(actual).toStrictEqual(expected);
	});

	it("handles list_append with strings", () => {
		const params = {
			Update: { numbersArray: 'list_append(["a", "b"], numbersArray)' },
		};
		const actual = dynoexpr(params);

		const expected = {
			UpdateExpression: "SET #n596ceb9c = list_append(:v3578c5eb, #n596ceb9c)",
			ExpressionAttributeNames: { "#n596ceb9c": "numbersArray" },
			ExpressionAttributeValues: { ":v3578c5eb": ["a", "b"] },
		};
		expect(actual).toStrictEqual(expected);
	});
});
