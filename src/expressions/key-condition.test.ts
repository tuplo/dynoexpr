import type { IKeyConditionInput } from "src/dynoexpr.d";

import { getKeyConditionExpression } from "./key-condition";

describe("key condition expression", () => {
	it("builds the ConditionExpression and NameValueMaps - comparison operators", () => {
		const KeyCondition = {
			a: "foo",
			b: "> 1",
			c: ">= 2",
			d: "< 3",
			e: "<= 4",
			f: "<> 5",
			fa: "<> true",
			g: "BETWEEN 6 AND 7",
			h: "IN (foo, bar)",
		};
		const args: IKeyConditionInput = { KeyCondition };
		const actual = getKeyConditionExpression(args);

		const expected = {
			KeyConditionExpression: [
				"#n69772661 = :vccc4a4d8",
				"#n7531578f > :v6f75849b",
				"#n408b5f33 >= :vcc14862c",
				"#n16e091ad < :vf2a7baf3",
				"#ne841ec32 <= :v7542122c",
				"#n1929cce7 <> :v74a318d5",
				"#n52c19e65 <> :v7534cb09",
				"#n3614845d between :v7eb1b2dc and :v4bea2543",
				"#n3a695e91 in (:vccc4a4d8,:v4f2d51f2)",
			]
				.map((exp) => `(${exp})`)
				.join(" AND "),
			ExpressionAttributeNames: {
				"#n69772661": "a",
				"#n7531578f": "b",
				"#n408b5f33": "c",
				"#n16e091ad": "d",
				"#ne841ec32": "e",
				"#n1929cce7": "f",
				"#n52c19e65": "fa",
				"#n3614845d": "g",
				"#n3a695e91": "h",
			},
			ExpressionAttributeValues: {
				":v4bea2543": 7,
				":v4f2d51f2": "bar",
				":v6f75849b": 1,
				":v74a318d5": 5,
				":v7534cb09": true,
				":v7542122c": 4,
				":v7eb1b2dc": 6,
				":vcc14862c": 2,
				":vccc4a4d8": "foo",
				":vf2a7baf3": 3,
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("builds the ConditionExpression and NameValueMaps - function", () => {
		const KeyCondition = {
			a: "attribute_exists",
			b: "attribute_not_exists",
			c: "attribute_type(S)",
			d: "begins_with(foo)",
			e: "contains(foo)",
			f: "size > 10",
		};
		const args: IKeyConditionInput = { KeyCondition };
		const actual = getKeyConditionExpression(args);

		const expected = {
			KeyConditionExpression: [
				"attribute_exists(#n69772661)",
				"attribute_not_exists(#n7531578f)",
				"attribute_type(#n408b5f33,:v1a47546e)",
				"begins_with(#n16e091ad,:vccc4a4d8)",
				"contains(#ne841ec32,:vccc4a4d8)",
				"size(#n1929cce7) > :vd163e820",
			]
				.map((exp) => `(${exp})`)
				.join(" AND "),
			ExpressionAttributeNames: {
				"#n16e091ad": "d",
				"#n1929cce7": "f",
				"#n408b5f33": "c",
				"#n69772661": "a",
				"#n7531578f": "b",
				"#ne841ec32": "e",
			},
			ExpressionAttributeValues: {
				":v1a47546e": "S",
				":vccc4a4d8": "foo",
				":vd163e820": 10,
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("builds the ConditionExpression and NameValueMaps - mixed operators", () => {
		const KeyCondition = {
			a: 1,
			b: "between 2 and 3",
			c: "size > 4",
		};
		const args: IKeyConditionInput = { KeyCondition };
		const actual = getKeyConditionExpression(args);

		const expected = {
			KeyConditionExpression: [
				"#n69772661 = :v6f75849b",
				"#n7531578f between :vcc14862c and :vf2a7baf3",
				"size(#n408b5f33) > :v7542122c",
			]
				.map((exp) => `(${exp})`)
				.join(" AND "),
			ExpressionAttributeNames: {
				"#n69772661": "a",
				"#n7531578f": "b",
				"#n408b5f33": "c",
			},
			ExpressionAttributeValues: {
				":v6f75849b": 1,
				":vcc14862c": 2,
				":vf2a7baf3": 3,
				":v7542122c": 4,
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
