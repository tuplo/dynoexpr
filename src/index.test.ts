import { DocumentClient } from "aws-sdk/clients/dynamodb";

import type { IDynoexprOutput } from "src/dynoexpr.d";

import dynoexpr from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertType<T, U extends T>(): void {
	expect.anything();
}

describe("high level API", () => {
	it("creates DynamoDb parameters", () => {
		const actual = dynoexpr({
			KeyCondition: { id: "567" },
			Condition: { rating: "> 4.5" },
			Filter: { color: "blue" },
			Projection: ["weight", "size"],
		});

		const expected = {
			ConditionExpression: "(#n8793843d > :va7bbf170)",
			ExpressionAttributeNames: {
				"#n395c1a24": "size",
				"#n4bce9bfd": "color",
				"#n75a60c8f": "id",
				"#n8793843d": "rating",
				"#nf337db8f": "weight",
			},
			ExpressionAttributeValues: {
				":v64c5aa3d": "567",
				":v91380c8f": "blue",
				":va7bbf170": 4.5,
			},
			FilterExpression: "(#n4bce9bfd = :v91380c8f)",
			KeyConditionExpression: "(#n75a60c8f = :v64c5aa3d)",
			ProjectionExpression: "#nf337db8f,#n395c1a24",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("doesn't require a type to be provided", () => {
		const args = dynoexpr({
			TableName: "Table",
			Key: 1,
			UpdateSet: { color: "pink" },
		});

		assertType<IDynoexprOutput, typeof args>();
		expect(args.TableName).toBe("Table");
	});

	it("accepts a type to be applied to the output", () => {
		const args = dynoexpr<DocumentClient.UpdateItemInput>({
			TableName: "Table",
			Key: 123,
			UpdateSet: { color: "pink" },
		});

		assertType<DocumentClient.ScanInput, typeof args>();
		expect(args.Key).toBe(123);
	});

	it("throws an error if it's working with Sets but doesn't have DocumentClient", () => {
		const fn = () => dynoexpr({ Update: { color: new Set(["blue"]) } });

		const expected =
			"dynoexpr: When working with Sets, please provide the AWS DocumentClient (v2).";
		expect(fn).toThrowError(expected);
	});

	it("accepts a provided DocumentClient (v2) for working with Sets", () => {
		const docClient = new DocumentClient();
		const color = new Set(["blue", "yellow"]);
		const actual = dynoexpr({
			UpdateSet: { color },
			DocumentClient,
		});

		const expected = {
			ExpressionAttributeNames: { "#n4bce9bfd": "color" },
			ExpressionAttributeValues: {
				":ve325d039": docClient.createSet(["blue", "yellow"]),
			},
			UpdateExpression: "SET #n4bce9bfd = :ve325d039",
		};
		expect(actual).toStrictEqual(expected);
	});
});
