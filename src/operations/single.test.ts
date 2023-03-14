import { DocumentClient as DocClientV2 } from "aws-sdk/clients/dynamodb";

import type { IDynoexprInput, IDynoexprOutput } from "src/dynoexpr.d";
import { AwsSdkDocumentClient } from "src/document-client";

import {
	getSingleTableExpressions,
	convertValuesToDynamoDbSet,
} from "./single";

describe("single table operations", () => {
	it("applies consecutive expression getters to a parameters object", () => {
		const args: IDynoexprInput = {
			KeyCondition: { c: 5 },
			Condition: { b: "> 10" },
			Filter: { a: "foo" },
			Projection: ["a", "b"],
			UpdateSet: { d: 7 },
			UpdateAdd: { e: 8 },
			UpdateDelete: { f: 9 },
			UpdateRemove: { g: "g" },
		};
		const actual = getSingleTableExpressions(args);

		const expected: IDynoexprOutput = {
			ConditionExpression: "(#ne4645342 > :va8d1f941)",
			FilterExpression: "(#na0f0d7ff = :v5f0025bb)",
			KeyConditionExpression: "(#n54601b21 = :v77e3e295)",
			ProjectionExpression: "#na0f0d7ff,#ne4645342",
			UpdateExpression:
				"SET #nae599c14 = :v11392247 REMOVE #n42f580fe ADD #n7c866780 :v48aa77a3 DELETE #n79761749 :vf489a8ba",
			ExpressionAttributeNames: {
				"#nae599c14": "d",
				"#n79761749": "f",
				"#n42f580fe": "g",
				"#n54601b21": "c",
				"#na0f0d7ff": "a",
				"#ne4645342": "b",
				"#n7c866780": "e",
			},
			ExpressionAttributeValues: {
				":v48aa77a3": 8,
				":v11392247": 7,
				":v77e3e295": 5,
				":vf489a8ba": 9,
				":v5f0025bb": "foo",
				":va8d1f941": 10,
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it.each<[string, IDynoexprInput, IDynoexprOutput]>([
		[
			"UpdateRemove",
			{ UpdateRemove: { a: "" } },
			{
				UpdateExpression: "REMOVE #na0f0d7ff",
				ExpressionAttributeNames: {
					"#na0f0d7ff": "a",
				},
			},
		],
		[
			"UpdateAction: 'REMOVE'",
			{ Update: { a: "" }, UpdateAction: "REMOVE" },
			{
				UpdateExpression: "REMOVE #na0f0d7ff",
				ExpressionAttributeNames: {
					"#na0f0d7ff": "a",
				},
			},
		],
		[
			"UpdateRemove with Projection",
			{ UpdateRemove: { foo: 1 }, Projection: ["bar"] },
			{
				UpdateExpression: "REMOVE #n5f0025bb",
				ExpressionAttributeNames: {
					"#n22f4f0ae": "bar",
					"#n5f0025bb": "foo",
				},
				ProjectionExpression: "#n22f4f0ae",
			},
		],
	])("doesn't include ExpressionAttributeValues: %s", (_, args, expected) => {
		const actual = getSingleTableExpressions(args);
		expect(actual).toStrictEqual(expected);
	});

	it("doesn't clash values for different expressions", () => {
		const args: IDynoexprInput = {
			KeyCondition: { a: 5 },
			Condition: { a: "> 10" },
			Filter: { a: 2 },
			Projection: ["a", "b"],
			UpdateSet: { a: 2 },
		};
		const actual = getSingleTableExpressions(args);

		const expected: IDynoexprOutput = {
			FilterExpression: "(#na0f0d7ff = :vaeeabc63)",
			KeyConditionExpression: "(#na0f0d7ff = :v77e3e295)",
			ProjectionExpression: "#na0f0d7ff,#ne4645342",
			UpdateExpression: "SET #na0f0d7ff = :vaeeabc63",
			ConditionExpression: "(#na0f0d7ff > :va8d1f941)",
			ExpressionAttributeNames: {
				"#na0f0d7ff": "a",
				"#ne4645342": "b",
			},
			ExpressionAttributeValues: {
				":v77e3e295": 5,
				":vaeeabc63": 2,
				":va8d1f941": 10,
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("keeps existing Names/Values", () => {
		const args: IDynoexprInput = {
			KeyCondition: { a: 5 },
			Condition: { a: "> 10" },
			Filter: { a: 2 },
			Projection: ["a", "b"],
			UpdateSet: { a: 2 },
			ExpressionAttributeNames: {
				"#foo": "foo",
			},
			ExpressionAttributeValues: {
				":foo": "bar",
			},
		};
		const actual = getSingleTableExpressions(args);

		const expected = {
			KeyConditionExpression: "(#na0f0d7ff = :v77e3e295)",
			ConditionExpression: "(#na0f0d7ff > :va8d1f941)",
			FilterExpression: "(#na0f0d7ff = :vaeeabc63)",
			ProjectionExpression: "#na0f0d7ff,#ne4645342",
			UpdateExpression: "SET #na0f0d7ff = :vaeeabc63",
			ExpressionAttributeNames: {
				"#na0f0d7ff": "a",
				"#ne4645342": "b",
				"#foo": "foo",
			},
			ExpressionAttributeValues: {
				":v77e3e295": 5,
				":vaeeabc63": 2,
				":va8d1f941": 10,
				":foo": "bar",
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	describe("documentClient Sets", () => {
		it("converts Sets to DynamoDbSet if present in ExpressionsAttributeValues", () => {
			const values = {
				a: 1,
				b: "foo",
				c: [1, 2, 3],
				d: { foo: "bar" },
				e: new Set([1, 2]),
				f: new Set(["foo", "bar"]),
			};
			AwsSdkDocumentClient.setDocumentClient(DocClientV2);
			const sdk = new AwsSdkDocumentClient();
			const actual = convertValuesToDynamoDbSet(values);

			const expected = {
				a: 1,
				b: "foo",
				c: [1, 2, 3],
				d: { foo: "bar" },
				e: sdk.createSet([1, 2]),
				f: sdk.createSet(["foo", "bar"]),
			};
			expect(actual).toStrictEqual(expected);
		});
	});
});
