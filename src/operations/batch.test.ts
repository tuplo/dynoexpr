import { getBatchExpressions } from "./batch";

describe("batch requests", () => {
	it("accepts batch operations: batchGet", () => {
		const args = {
			RequestItems: {
				"Table-1": {
					Keys: [{ foo: "bar" }],
					Projection: ["a", "b"],
				},
				"Table-2": {
					Keys: [{ foo: "bar" }],
					Projection: ["foo", "cast", "year", "baz"],
					ExpressionAttributeNames: {
						"#quz": "quz",
					},
				},
			},
		};
		const actual = getBatchExpressions(args);

		const expected = {
			RequestItems: {
				"Table-1": {
					Keys: [{ foo: "bar" }],
					ProjectionExpression: "#n69772661,#n7531578f",
					ExpressionAttributeNames: {
						"#n69772661": "a",
						"#n7531578f": "b",
					},
				},
				"Table-2": {
					Keys: [{ foo: "bar" }],
					ProjectionExpression: "#nccc4a4d8,#nf625c464,#n12f117d8,#nc85f6e88",
					ExpressionAttributeNames: {
						"#quz": "quz",
						"#nccc4a4d8": "foo",
						"#nf625c464": "cast",
						"#n12f117d8": "year",
						"#nc85f6e88": "baz",
					},
				},
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("accepts batch operations: batchWrite", () => {
		const args = {
			RequestItems: {
				"Table-1": [{ DeleteRequest: { Key: { foo: "bar" } } }],
				"Table-2": [{ PutRequest: { Key: { foo: "bar" } } }],
				"Table-3": [
					{ PutRequest: { Item: { baz: "buz" } } },
					{ PutRequest: { Item: { biz: "quz" } } },
				],
				"Table-4": [
					{ DeleteRequest: { Item: { baz: "buz" } } },
					{ DeleteRequest: { Item: { biz: "quz" } } },
				],
				"Table-5": [
					{ PutRequest: { Item: { baz: "buz" } } },
					{ DeleteRequest: { Item: { biz: "quz" } } },
				],
			},
		};
		const actual = getBatchExpressions(args);

		expect(actual).toStrictEqual(args);
	});
});
