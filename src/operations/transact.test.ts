import type { TransactRequestInput } from "../dynoexpr";

import { getTransactExpressions } from "./transact";

describe("transact requests", () => {
	it("accepts transact operations - transactGet", () => {
		const params = {
			TransactItems: [
				{
					Get: {
						TableName: "Table-1",
						Key: { id: "foo" },
						Projection: ["a", "b"],
					},
				},
				{
					Get: {
						TableName: "Table-2",
						Key: { id: "bar" },
						Projection: ["foo", "cast", "year", "baz"],
						ExpressionAttributeNames: {
							"#quz": "quz",
						},
					},
				},
			],
			ReturnConsumedCapacity: "INDEXES",
		} as TransactRequestInput;
		const result = getTransactExpressions(params);

		const expected = {
			TransactItems: [
				{
					Get: {
						TableName: "Table-1",
						Key: { id: "foo" },
						ProjectionExpression: "#n69772661,#n7531578f",
						ExpressionAttributeNames: {
							"#n69772661": "a",
							"#n7531578f": "b",
						},
					},
				},
				{
					Get: {
						TableName: "Table-2",
						Key: { id: "bar" },
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
			],
			ReturnConsumedCapacity: "INDEXES",
		};
		expect(result).toStrictEqual(expected);
	});

	it("accepts transact operations - transactWrite", () => {
		const params = {
			TransactItems: [
				{
					ConditionCheck: {
						TableName: "Table-1",
						Condition: { a: "foo" },
					},
				},
				{
					Put: {
						TableName: "Table-1",
						Condition: { b: "> 1" },
					},
				},
				{
					Delete: {
						TableName: "Table-2",
						Condition: { c: ">= 2" },
					},
				},
				{
					Update: {
						TableName: "Table-3",
						Update: { foo: "bar" },
					},
				},
			],
			ReturnConsumedCapacity: "INDEXES",
		};
		const result = getTransactExpressions(params);

		const expected = {
			ReturnConsumedCapacity: "INDEXES",
			TransactItems: [
				{
					ConditionCheck: {
						ConditionExpression: "(#n69772661 = :vccc4a4d8)",
						ExpressionAttributeNames: {
							"#n69772661": "a",
						},
						ExpressionAttributeValues: {
							":vccc4a4d8": "foo",
						},
						TableName: "Table-1",
					},
				},
				{
					Put: {
						ConditionExpression: "(#n7531578f > :v6f75849b)",
						ExpressionAttributeNames: {
							"#n7531578f": "b",
						},
						ExpressionAttributeValues: {
							":v6f75849b": 1,
						},
						TableName: "Table-1",
					},
				},
				{
					Delete: {
						ConditionExpression: "(#n408b5f33 >= :vcc14862c)",
						ExpressionAttributeNames: {
							"#n408b5f33": "c",
						},
						ExpressionAttributeValues: {
							":vcc14862c": 2,
						},
						TableName: "Table-2",
					},
				},
				{
					Update: {
						ExpressionAttributeNames: {
							"#nccc4a4d8": "foo",
						},
						ExpressionAttributeValues: {
							":v4f2d51f2": "bar",
						},
						TableName: "Table-3",
						UpdateExpression: "SET #nccc4a4d8 = :v4f2d51f2",
					},
				},
			],
		};
		expect(result).toStrictEqual(expected);
	});
});
