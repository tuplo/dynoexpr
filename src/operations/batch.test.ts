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
					ProjectionExpression: "#na0f0d7ff,#ne4645342",
					ExpressionAttributeNames: {
						"#na0f0d7ff": "a",
						"#ne4645342": "b",
					},
				},
				"Table-2": {
					Keys: [{ foo: "bar" }],
					ProjectionExpression: "#n5f0025bb,#n66d7cb7d,#n645820bf,#n82504b33",
					ExpressionAttributeNames: {
						"#quz": "quz",
						"#n5f0025bb": "foo",
						"#n66d7cb7d": "cast",
						"#n645820bf": "year",
						"#n82504b33": "baz",
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
