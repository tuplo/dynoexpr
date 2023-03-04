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
				"SET #nccc4a4d8 = #nccc4a4d8 - :vcc14862c, #n4f2d51f2 = :vcc14862c - #n4f2d51f2, #nc85f6e88 = #nc85f6e88 + :vc7c6ad26, #nf4d57aa0 = :v761dc2b7, #n842166e7 = :v81f92362, #n56cceeac = :v50ed5650, #n498f746d = :v89dff0bd",
			ExpressionAttributeNames: {
				"#nccc4a4d8": "foo",
				"#n4f2d51f2": "bar",
				"#nc85f6e88": "baz",
				"#n498f746d": "biz",
				"#nf4d57aa0": "bez",
				"#n842166e7": "buz",
				"#n56cceeac": "boz",
			},
			ExpressionAttributeValues: {
				":vcc14862c": 2,
				":vc7c6ad26": 9,
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
			UpdateExpression: "REMOVE #nccc4a4d8, #nc85f6e88",
			ExpressionAttributeNames: {
				"#nccc4a4d8": "foo",
				"#nc85f6e88": "baz",
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
				"ADD #nccc4a4d8 :v4f2d51f2, #nc85f6e88 :vcc14862c, #nf4d57aa0 :v5b66646d, #n842166e7 :v81f92362, #n56cceeac :v533877e7",
			ExpressionAttributeNames: {
				"#nccc4a4d8": "foo",
				"#nc85f6e88": "baz",
				"#n842166e7": "buz",
				"#nf4d57aa0": "bez",
				"#n56cceeac": "boz",
			},
			ExpressionAttributeValues: {
				":v4f2d51f2": "bar",
				":vcc14862c": 2,
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
				"DELETE #nccc4a4d8 :v4f2d51f2, #nc85f6e88 :vcc14862c, #nf4d57aa0 :v5b66646d, #n842166e7 :v81f92362, #n56cceeac :v533877e7",
			ExpressionAttributeNames: {
				"#n842166e7": "buz",
				"#nc85f6e88": "baz",
				"#nf4d57aa0": "bez",
				"#nccc4a4d8": "foo",
				"#n56cceeac": "boz",
			},
			ExpressionAttributeValues: {
				":v81f92362": { biz: 3 },
				":v4f2d51f2": "bar",
				":vcc14862c": 2,
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
				"SET #n1ec3ff12 = #n1ec3ff12 - :vcc14862c REMOVE #nd22a978b ADD #ndcbab01c :v85f1e948 DELETE #n063fd358 :vefe145cc",
			ExpressionAttributeNames: {
				"#n063fd358": "dfoo",
				"#n1ec3ff12": "ufoo",
				"#nd22a978b": "rfoo",
				"#ndcbab01c": "afoo",
			},
			ExpressionAttributeValues: {
				":v85f1e948": "abar",
				":vcc14862c": 2,
				":vefe145cc": "dbar",
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
