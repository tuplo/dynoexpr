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
			ConditionExpression: "(#n7531578f > :vd163e820)",
			FilterExpression: "(#n69772661 = :vccc4a4d8)",
			KeyConditionExpression: "(#n408b5f33 = :v74a318d5)",
			ProjectionExpression: "#n69772661,#n7531578f",
			UpdateExpression:
				"SET #n16e091ad = :v4bea2543 REMOVE #n3614845d ADD #ne841ec32 :v297e236d DELETE #n1929cce7 :vc7c6ad26",
			ExpressionAttributeNames: {
				"#n16e091ad": "d",
				"#n1929cce7": "f",
				"#n3614845d": "g",
				"#n408b5f33": "c",
				"#n69772661": "a",
				"#n7531578f": "b",
				"#ne841ec32": "e",
			},
			ExpressionAttributeValues: {
				":v297e236d": 8,
				":v4bea2543": 7,
				":v74a318d5": 5,
				":vc7c6ad26": 9,
				":vccc4a4d8": "foo",
				":vd163e820": 10,
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it.each<[string, IDynoexprInput, IDynoexprOutput]>([
		[
			"UpdateRemove",
			{ UpdateRemove: { a: "" } },
			{
				UpdateExpression: "REMOVE #n69772661",
				ExpressionAttributeNames: {
					"#n69772661": "a",
				},
			},
		],
		[
			"UpdateAction: 'REMOVE'",
			{ Update: { a: "" }, UpdateAction: "REMOVE" },
			{
				UpdateExpression: "REMOVE #n69772661",
				ExpressionAttributeNames: {
					"#n69772661": "a",
				},
			},
		],
		[
			"UpdateRemove with Projection",
			{ UpdateRemove: { foo: 1 }, Projection: ["bar"] },
			{
				UpdateExpression: "REMOVE #nccc4a4d8",
				ExpressionAttributeNames: {
					"#n4f2d51f2": "bar",
					"#nccc4a4d8": "foo",
				},
				ProjectionExpression: "#n4f2d51f2",
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
			FilterExpression: "(#n69772661 = :vcc14862c)",
			KeyConditionExpression: "(#n69772661 = :v74a318d5)",
			ProjectionExpression: "#n69772661,#n7531578f",
			UpdateExpression: "SET #n69772661 = :vcc14862c",
			ConditionExpression: "(#n69772661 > :vd163e820)",
			ExpressionAttributeNames: {
				"#n69772661": "a",
				"#n7531578f": "b",
			},
			ExpressionAttributeValues: {
				":v74a318d5": 5,
				":vcc14862c": 2,
				":vd163e820": 10,
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
			KeyConditionExpression: "(#n69772661 = :v74a318d5)",
			ConditionExpression: "(#n69772661 > :vd163e820)",
			FilterExpression: "(#n69772661 = :vcc14862c)",
			ProjectionExpression: "#n69772661,#n7531578f",
			UpdateExpression: "SET #n69772661 = :vcc14862c",
			ExpressionAttributeNames: {
				"#n69772661": "a",
				"#n7531578f": "b",
				"#foo": "foo",
			},
			ExpressionAttributeValues: {
				":v74a318d5": 5,
				":vcc14862c": 2,
				":vd163e820": 10,
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
