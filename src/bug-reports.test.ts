import { vi } from "vitest";

import dynoexpr from "./index";

describe("bug reports", () => {
	it("logical operator", () => {
		const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(1646249594000);
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
		const actual = dynoexpr(args);

		const expected = {
			ConditionExpression:
				"(#nfc6b756c = :v84e520b4) OR (#nfc6b756c = :ve0304017)",
			ExpressionAttributeNames: {
				"#n3974b0c4": "GSI1_PK",
				"#nfc6b756c": "status",
				"#n93dbb70d": "modified",
				"#n87f01ccc": "GSI2_PK",
			},
			ExpressionAttributeValues: {
				":vb60424a8": "2022-03-02T19:33:14.000Z",
				":v985d200a": "REQUEST#STATUS#open#DATE#2022-03-01T13:58:09.242z",
				":v84e520b4": "IN_PROGRESS",
				":ve0304017": "OPEN",
			},
			UpdateExpression:
				"SET #n93dbb70d = :vb60424a8, #n3974b0c4 = :ve0304017, #n87f01ccc = :v985d200a",
		};
		expect(actual).toStrictEqual(expected);

		dateNowSpy.mockRestore();
	});

	it("supports if_not_exists on update expressions", () => {
		const args = {
			Update: { number: "if_not_exists(420)" },
		};
		const actual = dynoexpr(args);

		const expected = {
			UpdateExpression:
				"SET #nc66bcf16 = if_not_exists(#nc66bcf16, :v70d78b9d)",
			ExpressionAttributeNames: { "#nc66bcf16": "number" },
			ExpressionAttributeValues: { ":v70d78b9d": "420" },
		};
		expect(actual).toStrictEqual(expected);
	});

	it("allows boolean values", () => {
		const Filter = {
			a: "<> true",
			b: "<> false",
		};
		const args = { Filter };
		const actual = dynoexpr(args);

		const expected = {
			ExpressionAttributeNames: { "#na0f0d7ff": "a", "#ne4645342": "b" },
			ExpressionAttributeValues: { ":v976fa742": false, ":vc86ac629": true },
			FilterExpression:
				"(#na0f0d7ff <> :vc86ac629) AND (#ne4645342 <> :v976fa742)",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("empty ExpressionAttributeValues on UpdateRemove with Condition", () => {
		const args = {
			UpdateRemove: { "parent.item": 1 },
			Condition: { "parent.item": "attribute_exists" },
		};
		const actual = dynoexpr(args);

		const expected = {
			ConditionExpression: "(attribute_exists(#ndae5997d.#ncc96b5ad))",
			ExpressionAttributeNames: {
				"#ncc96b5ad": "item",
				"#ndae5997d": "parent",
			},
			UpdateExpression: "REMOVE #ndae5997d.#ncc96b5ad",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("pass undefined to UpdateRemove", () => {
		const args = {
			UpdateRemove: { "parent.item": undefined },
			Condition: { "parent.item": "attribute_exists" },
		};
		const actual = dynoexpr(args);

		const expected = {
			ConditionExpression: "(attribute_exists(#ndae5997d.#ncc96b5ad))",
			ExpressionAttributeNames: {
				"#ncc96b5ad": "item",
				"#ndae5997d": "parent",
			},
			UpdateExpression: "REMOVE #ndae5997d.#ncc96b5ad",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("handles list_append", () => {
		const args = {
			Update: { numbersArray: "list_append([1, 2], numbersArray)" },
		};
		const actual = dynoexpr(args);

		const expected = {
			UpdateExpression: "SET #ne0c11d8d = list_append(:v31e6eb45, #ne0c11d8d)",
			ExpressionAttributeNames: { "#ne0c11d8d": "numbersArray" },
			ExpressionAttributeValues: { ":v31e6eb45": [1, 2] },
		};
		expect(actual).toStrictEqual(expected);
	});

	it("handles list_append with strings", () => {
		const args = {
			Update: { numbersArray: 'list_append(["a", "b"], numbersArray)' },
		};
		const actual = dynoexpr(args);

		const expected = {
			UpdateExpression: "SET #ne0c11d8d = list_append(:v3578c5eb, #ne0c11d8d)",
			ExpressionAttributeNames: { "#ne0c11d8d": "numbersArray" },
			ExpressionAttributeValues: { ":v3578c5eb": ["a", "b"] },
		};
		expect(actual).toStrictEqual(expected);
	});

	it("handles composite keys on updates with math operations", () => {
		const args = {
			Update: {
				"foo.bar.baz": "foo.bar.baz + 1",
			},
		};
		const actual = dynoexpr(args);

		const expected = {
			ExpressionAttributeNames: {
				"#n22f4f0ae": "bar",
				"#n5f0025bb": "foo",
				"#n82504b33": "baz",
			},
			ExpressionAttributeValues: {
				":vc823bd86": 1,
			},
			UpdateExpression:
				"SET #n5f0025bb.#n22f4f0ae.#n82504b33 = #n5f0025bb.#n22f4f0ae.#n82504b33 + :vc823bd86",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("escape dynamic keys in objects", () => {
		const dynamicKey = "key.with-chars";
		const args = {
			Update: {
				[`object."${dynamicKey}".value`]: `object."${dynamicKey}".value + 1`,
			},
			Condition: { [`object."${dynamicKey}".value`]: "> 2" },
		};
		const actual = dynoexpr(args);

		const expected = {
			ConditionExpression: "(#nbb017076.#n0327a04a.#n10d6f4c5 > :vaeeabc63)",
			ExpressionAttributeNames: {
				"#nbb017076": "object",
				"#n0327a04a": "key.with-chars",
				"#n10d6f4c5": "value",
			},
			ExpressionAttributeValues: {
				":vaeeabc63": 2,
				":vc823bd86": 1,
			},
			UpdateExpression:
				"SET #nbb017076.#n0327a04a.#n10d6f4c5 = #nbb017076.#n0327a04a.#n10d6f4c5 + :vc823bd86",
		};
		expect(actual).toStrictEqual(expected);
	});
});
