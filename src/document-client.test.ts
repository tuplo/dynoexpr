import { DocumentClient as DocClientV2 } from "aws-sdk/clients/dynamodb";

import { AwsSdkDocumentClient } from "./document-client";

describe("aws sdk document client", () => {
	afterEach(() => {
		AwsSdkDocumentClient.setDocumentClient(null);
	});

	it("throws an error when there's no AWS SKD provided", () => {
		const docClient = new AwsSdkDocumentClient();
		const fn = () => docClient.createSet([1, 2, 3]);

		const expected =
			"dynoexpr: When working with Sets, please provide the AWS DocumentClient (v2).";
		expect(fn).toThrowError(expected);
	});

	it("creates a AWS Set using AWS SDK DocumentClient v2", () => {
		AwsSdkDocumentClient.setDocumentClient(DocClientV2);
		const docClient = new AwsSdkDocumentClient();
		const actual = docClient.createSet([1, 2, 3]);

		const awsDocClient = new DocClientV2();
		const expected = awsDocClient.createSet([1, 2, 3]);
		expect(actual).toStrictEqual(expected);
	});

	describe("creates sets", () => {
		const docClient = new AwsSdkDocumentClient();

		beforeEach(() => {
			AwsSdkDocumentClient.setDocumentClient(DocClientV2);
		});

		it("creates DynamoDBSet instances for strings", () => {
			const args = ["hello", "world"];
			const actual = docClient.createSet(args);

			expect(actual.type).toBe("String");
			expect(actual.values).toHaveLength(args.length);
			expect(actual.values).toContain("hello");
			expect(actual.values).toContain("world");
		});

		it("creates DynamoDBSet instances for numbers", () => {
			const args = [42, 1, 2];
			const actual = docClient.createSet(args);

			expect(actual.type).toBe("Number");
			expect(actual.values).toHaveLength(args.length);
			expect(actual.values).toContain(42);
			expect(actual.values).toContain(1);
			expect(actual.values).toContain(2);
		});

		it("creates DynamoDBSet instances for binary types", () => {
			const args = [
				Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]),
				Buffer.from([0x61, 0x62, 0x63]),
			];
			const actual = docClient.createSet(args);

			expect(actual.type).toBe("Binary");
			expect(actual.values).toHaveLength(args.length);
			expect(actual.values).toContainEqual(args[0]);
			expect(actual.values).toContain(args[1]);
		});

		it("does not throw an error with mixed set types if validation is not explicitly enabled", () => {
			const args = ["hello", 42];
			const actual = docClient.createSet(args);

			expect(actual.type).toBe("String");
			expect(actual.values).toHaveLength(args.length);
			expect(actual.values).toContain("hello");
			expect(actual.values).toContain(42);
		});

		it("throws an error with mixed set types if validation is enabled", () => {
			const params = ["hello", 42];
			const expression = () => docClient.createSet(params, { validate: true });

			const expected = "String Set contains Number value";
			expect(expression).toThrow(expected);
		});
	});
});
