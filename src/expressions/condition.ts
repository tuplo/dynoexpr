import type { IConditionInput, IConditionOutput } from "src/dynoexpr.d";

import {
	buildConditionAttributeNames,
	buildConditionAttributeValues,
	buildConditionExpression,
} from "./helpers";

export function getConditionExpression(params: IConditionInput = {}) {
	if (!params.Condition) {
		return params;
	}

	const { Condition, ConditionLogicalOperator, ...restOfParams } = params;

	const ConditionExpression = buildConditionExpression({
		Condition,
		LogicalOperator: ConditionLogicalOperator,
	});

	const paramsWithConditions: IConditionOutput = {
		...restOfParams,
		ConditionExpression,
		ExpressionAttributeNames: buildConditionAttributeNames(Condition, params),
		ExpressionAttributeValues: buildConditionAttributeValues(Condition, params),
	};

	const { ExpressionAttributeNames, ExpressionAttributeValues } =
		paramsWithConditions;

	if (Object.keys(ExpressionAttributeNames || {}).length === 0) {
		delete paramsWithConditions.ExpressionAttributeNames;
	}

	if (Object.keys(ExpressionAttributeValues || {}).length === 0) {
		delete paramsWithConditions.ExpressionAttributeValues;
	}

	return paramsWithConditions;
}
