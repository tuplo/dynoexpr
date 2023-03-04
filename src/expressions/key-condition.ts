import type { IKeyConditionInput } from "src/dynoexpr.d";

import {
	buildConditionAttributeNames,
	buildConditionAttributeValues,
	buildConditionExpression,
} from "./helpers";

export function getKeyConditionExpression(params: IKeyConditionInput = {}) {
	if (!params.KeyCondition) {
		return params;
	}

	const { KeyCondition, KeyConditionLogicalOperator, ...restOfParams } = params;

	const KeyConditionExpression = buildConditionExpression({
		Condition: KeyCondition,
		LogicalOperator: KeyConditionLogicalOperator,
	});

	const ExpressionAttributeNames = buildConditionAttributeNames(
		KeyCondition,
		params
	);

	const ExpressionAttributeValues = buildConditionAttributeValues(
		KeyCondition,
		params
	);

	return {
		...restOfParams,
		KeyConditionExpression,
		ExpressionAttributeNames,
		ExpressionAttributeValues,
	};
}
