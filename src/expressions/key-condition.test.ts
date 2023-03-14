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
				"#na0f0d7ff = :v5f0025bb",
				"#ne4645342 > :vc823bd86",
				"#n54601b21 >= :vaeeabc63",
				"#nae599c14 < :vf13631fc",
				"#n7c866780 <= :vdd20580d",
				"#n79761749 <> :v77e3e295",
				"#n14e68f2d <> :vc86ac629",
				"#n42f580fe between :vde135ba3 and :v11392247",
				"#ne38a286c in (:v5f0025bb,:v22f4f0ae)",
			]
				.map((exp) => `(${exp})`)
				.join(" AND "),
			ExpressionAttributeNames: {
				"#na0f0d7ff": "a",
				"#ne4645342": "b",
				"#n54601b21": "c",
				"#nae599c14": "d",
				"#n7c866780": "e",
				"#n79761749": "f",
				"#n14e68f2d": "fa",
				"#n42f580fe": "g",
				"#ne38a286c": "h",
			},
			ExpressionAttributeValues: {
				":v11392247": 7,
				":v22f4f0ae": "bar",
				":vc823bd86": 1,
				":v77e3e295": 5,
				":vc86ac629": true,
				":vdd20580d": 4,
				":vde135ba3": 6,
				":vaeeabc63": 2,
				":v5f0025bb": "foo",
				":vf13631fc": 3,
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
				"attribute_exists(#na0f0d7ff)",
				"attribute_not_exists(#ne4645342)",
				"attribute_type(#n54601b21,:va6a17c2f)",
				"begins_with(#nae599c14,:v5f0025bb)",
				"contains(#n7c866780,:v5f0025bb)",
				"size(#n79761749) > :va8d1f941",
			]
				.map((exp) => `(${exp})`)
				.join(" AND "),
			ExpressionAttributeNames: {
				"#nae599c14": "d",
				"#n79761749": "f",
				"#n54601b21": "c",
				"#na0f0d7ff": "a",
				"#ne4645342": "b",
				"#n7c866780": "e",
			},
			ExpressionAttributeValues: {
				":va6a17c2f": "S",
				":v5f0025bb": "foo",
				":va8d1f941": 10,
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
				"#na0f0d7ff = :vc823bd86",
				"#ne4645342 between :vaeeabc63 and :vf13631fc",
				"size(#n54601b21) > :vdd20580d",
			]
				.map((exp) => `(${exp})`)
				.join(" AND "),
			ExpressionAttributeNames: {
				"#na0f0d7ff": "a",
				"#ne4645342": "b",
				"#n54601b21": "c",
			},
			ExpressionAttributeValues: {
				":vc823bd86": 1,
				":vaeeabc63": 2,
				":vf13631fc": 3,
				":vdd20580d": 4,
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
