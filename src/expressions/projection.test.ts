import type { IProjectionInput } from "src/dynoexpr.d";

import { getProjectionExpression } from "./projection";

describe("projection expression", () => {
	it("converts a ProjectionExpression to ExpressionAttributesMap", () => {
		const args: IProjectionInput = {
			Projection: ["foo", "cast", "year", "baz"],
		};
		const actual = getProjectionExpression(args);

		const expected = {
			ProjectionExpression: "#nccc4a4d8,#nf625c464,#n12f117d8,#nc85f6e88",
			ExpressionAttributeNames: {
				"#n12f117d8": "year",
				"#nc85f6e88": "baz",
				"#nccc4a4d8": "foo",
				"#nf625c464": "cast",
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("adds new names to an existing ExpressionAttributesMap", () => {
		const args: IProjectionInput = {
			Projection: ["foo", "cast", "year", "baz"],
			ExpressionAttributeNames: {
				"#quz": "quz",
			},
		};
		const actual = getProjectionExpression(args);

		const expected = {
			ProjectionExpression: "#nccc4a4d8,#nf625c464,#n12f117d8,#nc85f6e88",
			ExpressionAttributeNames: {
				"#quz": "quz",
				"#n12f117d8": "year",
				"#nc85f6e88": "baz",
				"#nccc4a4d8": "foo",
				"#nf625c464": "cast",
			},
		};
		expect(actual).toStrictEqual(expected);
	});

	it("maintains existing ProjectionExpression names", () => {
		const args: IProjectionInput = {
			Projection: ["foo", "baz"],
			ExpressionAttributeNames: {
				"#foo": "foo",
			},
		};
		const actual = getProjectionExpression(args);

		const expected = {
			ProjectionExpression: "#nccc4a4d8,#nc85f6e88",
			ExpressionAttributeNames: {
				"#foo": "foo",
				"#nccc4a4d8": "foo",
				"#nc85f6e88": "baz",
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
