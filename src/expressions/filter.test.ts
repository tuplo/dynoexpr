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
				"#n69772661 = :vccc4a4d8",
				"#n7531578f > :v6f75849b",
				"#n408b5f33 >= :vcc14862c",
				"#n16e091ad < :vf2a7baf3",
				"#ne841ec32 <= :v7542122c",
				"#n1929cce7 <> :v74a318d5",
				"#n52c19e65 <> :v7534cb09",
				"#n3614845d > :v109360bf",
				"#n3a695e91 >= :vc585d432",
				"#n7c1a8741 < :v16f2aa5c",
				"#nbab05515 <= :v1f299a54",
				"#ne8759df3 <> :v97007eb4",
				"#nb2013b33 between :v7eb1b2dc and :v4bea2543",
				"#nd9a1501b between :v03297b79 and :v723c5c24",
				"#nb31363a1 in (:vccc4a4d8,:v4f2d51f2)",
			]
				.map((exp) => `(${exp})`)
				.join(" AND "),
			ExpressionAttributeNames: {
				"#n16e091ad": "d",
				"#n1929cce7": "f",
				"#n3614845d": "g",
				"#n3a695e91": "h",
				"#n408b5f33": "c",
				"#n52c19e65": "fa",
				"#n69772661": "a",
				"#n7531578f": "b",
				"#n7c1a8741": "i",
				"#nb2013b33": "l",
				"#nb31363a1": "n",
				"#nbab05515": "j",
				"#nd9a1501b": "m",
				"#ne841ec32": "e",
				"#ne8759df3": "k",
			},
			ExpressionAttributeValues: {
				":v03297b79": "you",
				":v109360bf": "six",
				":v16f2aa5c": "eight",
				":v1f299a54": "nine",
				":v4bea2543": 7,
				":v4f2d51f2": "bar",
				":v6f75849b": 1,
				":v723c5c24": "me",
				":v74a318d5": 5,
				":v7534cb09": true,
				":v7542122c": 4,
				":v7eb1b2dc": 6,
				":v97007eb4": "ten",
				":vc585d432": "seven",
				":vcc14862c": 2,
				":vccc4a4d8": "foo",
				":vf2a7baf3": 3,
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
				":v7542122c": 4,
				":vcc14862c": 2,
				":vf2a7baf3": 3,
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
