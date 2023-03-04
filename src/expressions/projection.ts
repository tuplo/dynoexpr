import type { IProjectionInput } from "src/dynoexpr.d";

import { getAttrName } from "../utils";

export function getProjectionExpression(params: IProjectionInput = {}) {
	if (!params.Projection) {
		return params;
	}

	const { Projection, ...restOfParams } = params;

	const fields = Projection.map((field) => field.trim());

	const ProjectionExpression = fields.map(getAttrName).join(",");

	const ExpressionAttributeNames = fields.reduce((acc, field) => {
		const attrName = getAttrName(field);
		if (attrName in acc) return acc;
		acc[attrName] = field;
		return acc;
	}, params.ExpressionAttributeNames || {});

	return {
		...restOfParams,
		ProjectionExpression,
		ExpressionAttributeNames,
	};
}
