import type { IFilterInput } from "src/dynoexpr.d";

import { getFilterExpression } from "./filter";

describe("filter expression", () => {
	it("builds the FilterExpression and NameValueMaps - comparison operators", () => {
		const Filter = {
			a: "foo",
			b: "> 1",
			c: ">= 2",
			d: "< 3",
			e: "<= 4",
			f: "<> 5",
			fa: "<> true",
			g: "> six",
			h: ">= seven",
			i: "< eight",
			j: "<= nine",
			k: "<> ten",
			l: "BETWEEN 6 AND 7",
			m: "BETWEEN you AND me",
			n: "IN (foo, bar)",
		};
		const args: IFilterInput = { Filter };
		const actual = getFilterExpression(args);

		const expected = {
			FilterExpression: [
				"#na0f0d7ff = :v5f0025bb",
				"#ne4645342 > :vc823bd86",
				"#n54601b21 >= :vaeeabc63",
				"#nae599c14 < :vf13631fc",
				"#n7c866780 <= :vdd20580d",
				"#n79761749 <> :v77e3e295",
				"#n14e68f2d <> :vc86ac629",
				"#n42f580fe > :v9ff5e5a8",
				"#ne38a286c >= :vf15a7556",
				"#n7892115e < :v91e83ab7",
				"#nc25f380c <= :vc215685d",
				"#n3cabadaa <> :vcd0bee5c",
				"#nc56d6c80 between :vde135ba3 and :v11392247",
				"#ne9b7120d between :ve5f8e70a and :v1ca860bf",
				"#ne692f12a in (:v5f0025bb,:v22f4f0ae)",
			]
				.map((exp) => `(${exp})`)
				.join(" AND "),
			ExpressionAttributeNames: {
				"#nae599c14": "d",
				"#n79761749": "f",
				"#n42f580fe": "g",
				"#ne38a286c": "h",
				"#n54601b21": "c",
				"#n14e68f2d": "fa",
				"#na0f0d7ff": "a",
				"#ne4645342": "b",
				"#n7892115e": "i",
				"#nc56d6c80": "l",
				"#ne692f12a": "n",
				"#nc25f380c": "j",
				"#ne9b7120d": "m",
				"#n7c866780": "e",
				"#n3cabadaa": "k",
			},
			ExpressionAttributeValues: {
				":ve5f8e70a": "you",
				":v9ff5e5a8": "six",
				":v91e83ab7": "eight",
				":vc215685d": "nine",
				":v11392247": 7,
				":v22f4f0ae": "bar",
				":vc823bd86": 1,
				":v1ca860bf": "me",
				":v77e3e295": 5,
				":vc86ac629": true,
				":vdd20580d": 4,
				":vde135ba3": 6,
				":vcd0bee5c": "ten",
				":vf15a7556": "seven",
				":vaeeabc63": 2,
				":v5f0025bb": "foo",
				":vf13631fc": 3,
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("builds the FilterExpression and NameValueMaps - function", () => {
		const Filter = {
			a: "attribute_exists",
			b: "attribute_not_exists",
			c: "attribute_type(S)",
			d: "begins_with(foo)",
			e: "contains(foo)",
			f: "size > 10",
		};
		const args: IFilterInput = { Filter };
		const actual = getFilterExpression(args);

		const expected = {
			FilterExpression: [
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

	it("builds the FilterExpression and NameValueMaps - mixed operators", () => {
		const Filter = {
			a: 1,
			b: "between 2 and 3",
			c: "size > 4",
		};
		const args: IFilterInput = { Filter };
		const actual = getFilterExpression(args);

		const expected = {
			FilterExpression: [
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
				":vdd20580d": 4,
				":vaeeabc63": 2,
				":vf13631fc": 3,
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
