import type { ProjectionInput, ProjectionOutput } from "../dynoexpr";
import { getAttrName } from "../utils";

type GetProjectionExpressionFn = (params?: ProjectionInput) => ProjectionOutput;
export const getProjectionExpression: GetProjectionExpressionFn = (
	params = {}
) => {
	if (!params.Projection) return params;
	const { Projection, ExpressionAttributeNames = {}, ...restOfParams } = params;
	const fields = Projection.map((field) => field.trim());
	return {
		...restOfParams,
		ProjectionExpression: fields.map(getAttrName).join(","),
		ExpressionAttributeNames: fields.reduce((acc, field) => {
			const attrName = getAttrName(field);
			if (attrName in acc) return acc;
			acc[attrName] = field;
			return acc;
		}, ExpressionAttributeNames as { [key: string]: string }),
	};
};
