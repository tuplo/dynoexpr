import type { ITransactRequestInput } from "src/dynoexpr.d";

import { getTransactExpressions } from "./transact";

describe("transact requests", () => {
	it("accepts transact operations - transactGet", () => {
		const args = {
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
		} as ITransactRequestInput;
		const actual = getTransactExpressions(args);

		const expected = {
			TransactItems: [
				{
					Get: {
						TableName: "Table-1",
						Key: { id: "foo" },
						ProjectionExpression: "#na0f0d7ff,#ne4645342",
						ExpressionAttributeNames: {
							"#na0f0d7ff": "a",
							"#ne4645342": "b",
						},
					},
				},
				{
					Get: {
						TableName: "Table-2",
						Key: { id: "bar" },
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
			],
			ReturnConsumedCapacity: "INDEXES",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("accepts transact operations - transactWrite", () => {
		const args = {
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
		const actual = getTransactExpressions(args);

		const expected = {
			ReturnConsumedCapacity: "INDEXES",
			TransactItems: [
				{
					ConditionCheck: {
						ConditionExpression: "(#na0f0d7ff = :v5f0025bb)",
						ExpressionAttributeNames: {
							"#na0f0d7ff": "a",
						},
						ExpressionAttributeValues: {
							":v5f0025bb": "foo",
						},
						TableName: "Table-1",
					},
				},
				{
					Put: {
						ConditionExpression: "(#ne4645342 > :vc823bd86)",
						ExpressionAttributeNames: {
							"#ne4645342": "b",
						},
						ExpressionAttributeValues: {
							":vc823bd86": 1,
						},
						TableName: "Table-1",
					},
				},
				{
					Delete: {
						ConditionExpression: "(#n54601b21 >= :vaeeabc63)",
						ExpressionAttributeNames: {
							"#n54601b21": "c",
						},
						ExpressionAttributeValues: {
							":vaeeabc63": 2,
						},
						TableName: "Table-2",
					},
				},
				{
					Update: {
						ExpressionAttributeNames: {
							"#n5f0025bb": "foo",
						},
						ExpressionAttributeValues: {
							":v22f4f0ae": "bar",
						},
						TableName: "Table-3",
						UpdateExpression: "SET #n5f0025bb = :v22f4f0ae",
					},
				},
			],
		};
		expect(actual).toStrictEqual(expected);
	});
});
