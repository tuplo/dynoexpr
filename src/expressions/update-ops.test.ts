import type { IUpdateInput } from "src/dynoexpr.d";

import {
	getUpdateAddExpression,
	getUpdateDeleteExpression,
	getUpdateOperationsExpression,
	getUpdateRemoveExpression,
	getUpdateSetExpression,
} from "./update-ops";

describe("update operations - SET/REMOVE/ADD/DELETE", () => {
	it("builds a SET update expression", () => {
		const args: IUpdateInput = {
			UpdateSet: {
				foo: "foo - 2",
				bar: "2 - bar",
				baz: "baz + 9",
				bez: [1, 2, 3],
				buz: { biz: 3 },
				boz: [{ qux: 2 }],
				biz: null,
			},
		};
		const actual = getUpdateSetExpression(args);

		const expected = {
			UpdateExpression:
				"SET #n5f0025bb = #n5f0025bb - :vaeeabc63, #n22f4f0ae = :vaeeabc63 - #n22f4f0ae, #n82504b33 = #n82504b33 + :vf489a8ba, #ne4642e6a = :v761dc2b7, #nadc27efb = :v81f92362, #n5fae6dd3 = :v50ed5650, #n025c5f64 = :v89dff0bd",
			ExpressionAttributeNames: {
				"#n5f0025bb": "foo",
				"#n22f4f0ae": "bar",
				"#n82504b33": "baz",
				"#n025c5f64": "biz",
				"#ne4642e6a": "bez",
				"#nadc27efb": "buz",
				"#n5fae6dd3": "boz",
			},
			ExpressionAttributeValues: {
				":vaeeabc63": 2,
				":vf489a8ba": 9,
				":v81f92362": { biz: 3 },
				":v50ed5650": [{ qux: 2 }],
				":v761dc2b7": [1, 2, 3],
				":v89dff0bd": null,
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("builds a REMOVE update expression", () => {
		const args = {
			UpdateRemove: {
				foo: "bar",
				baz: 2,
			},
		};
		const actual = getUpdateRemoveExpression(args);

		const expected = {
			UpdateExpression: "REMOVE #n5f0025bb, #n82504b33",
			ExpressionAttributeNames: {
				"#n5f0025bb": "foo",
				"#n82504b33": "baz",
			},
			ExpressionAttributeValues: {},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("builds an ADD update expression", () => {
		const args = {
			UpdateAdd: {
				foo: "bar",
				baz: 2,
				bez: [1, 2, 3],
				buz: { biz: 3 },
				boz: [{ qux: 2 }],
			},
		};
		const actual = getUpdateAddExpression(args);

		const expected = {
			UpdateExpression:
				"ADD #n5f0025bb :v22f4f0ae, #n82504b33 :vaeeabc63, #ne4642e6a :v5b66646d, #nadc27efb :v81f92362, #n5fae6dd3 :v533877e7",
			ExpressionAttributeNames: {
				"#n5f0025bb": "foo",
				"#n82504b33": "baz",
				"#nadc27efb": "buz",
				"#ne4642e6a": "bez",
				"#n5fae6dd3": "boz",
			},
			ExpressionAttributeValues: {
				":v22f4f0ae": "bar",
				":vaeeabc63": 2,
				":v81f92362": { biz: 3 },
				":v533877e7": new Set([{ qux: 2 }]),
				":v5b66646d": new Set([1, 2, 3]),
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("builds a DELETE update expression", () => {
		const args = {
			UpdateDelete: {
				foo: "bar",
				baz: 2,
				bez: [1, 2, 3],
				buz: { biz: 3 },
				boz: [{ qux: 2 }],
			},
		};
		const actual = getUpdateDeleteExpression(args);

		const expected = {
			UpdateExpression:
				"DELETE #n5f0025bb :v22f4f0ae, #n82504b33 :vaeeabc63, #ne4642e6a :v5b66646d, #nadc27efb :v81f92362, #n5fae6dd3 :v533877e7",
			ExpressionAttributeNames: {
				"#nadc27efb": "buz",
				"#n82504b33": "baz",
				"#ne4642e6a": "bez",
				"#n5f0025bb": "foo",
				"#n5fae6dd3": "boz",
			},
			ExpressionAttributeValues: {
				":v81f92362": { biz: 3 },
				":v22f4f0ae": "bar",
				":vaeeabc63": 2,
				":v533877e7": new Set([{ qux: 2 }]),
				":v5b66646d": new Set([1, 2, 3]),
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("builds multiple update expressions", () => {
		const args = {
			UpdateSet: { ufoo: "ufoo - 2" },
			UpdateRemove: { rfoo: "rbar" },
			UpdateAdd: { afoo: "abar" },
			UpdateDelete: { dfoo: "dbar" },
		};
		const actual = getUpdateOperationsExpression(args);

		const expected = {
			UpdateExpression:
				"SET #n30eb7c82 = #n30eb7c82 - :vaeeabc63 REMOVE #na6e432d1 ADD #n7cb54de8 :vca09015b DELETE #nca5c700c :v9b57e285",
			ExpressionAttributeNames: {
				"#nca5c700c": "dfoo",
				"#n30eb7c82": "ufoo",
				"#na6e432d1": "rfoo",
				"#n7cb54de8": "afoo",
			},
			ExpressionAttributeValues: {
				":vca09015b": "abar",
				":vaeeabc63": 2,
				":v9b57e285": "dbar",
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
