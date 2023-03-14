import type { IProjectionInput } from "src/dynoexpr.d";

import { getProjectionExpression } from "./projection";

describe("projection expression", () => {
	it("converts a ProjectionExpression to ExpressionAttributesMap", () => {
		const args: IProjectionInput = {
			Projection: ["foo", "cast", "year", "baz"],
		};
		const actual = getProjectionExpression(args);

		const expected = {
			ProjectionExpression: "#n5f0025bb,#n66d7cb7d,#n645820bf,#n82504b33",
			ExpressionAttributeNames: {
				"#n645820bf": "year",
				"#n82504b33": "baz",
				"#n5f0025bb": "foo",
				"#n66d7cb7d": "cast",
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
			ProjectionExpression: "#n5f0025bb,#n66d7cb7d,#n645820bf,#n82504b33",
			ExpressionAttributeNames: {
				"#quz": "quz",
				"#n645820bf": "year",
				"#n82504b33": "baz",
				"#n5f0025bb": "foo",
				"#n66d7cb7d": "cast",
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
			ProjectionExpression: "#n5f0025bb,#n82504b33",
			ExpressionAttributeNames: {
				"#foo": "foo",
				"#n5f0025bb": "foo",
				"#n82504b33": "baz",
			},
		};
		expect(actual).toStrictEqual(expected);
	});
});
