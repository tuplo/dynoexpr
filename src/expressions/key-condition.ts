import type { KeyConditionInput, KeyConditionOutput } from "../dynoexpr";
import {
	buildConditionAttributeNames,
	buildConditionAttributeValues,
	buildConditionExpression,
} from "./helpers";

type GetKeyConditionExpressionFn = (
	params?: KeyConditionInput
) => KeyConditionOutput;
export const getKeyConditionExpression: GetKeyConditionExpressionFn = (
	params = {}
) => {
	if (!params.KeyCondition) return params;
	const { KeyCondition, KeyConditionLogicalOperator, ...restOfParams } = params;
	return {
		...restOfParams,
		KeyConditionExpression: buildConditionExpression({
			Condition: KeyCondition,
			LogicalOperator: KeyConditionLogicalOperator,
		}),
		ExpressionAttributeNames: buildConditionAttributeNames(
			KeyCondition,
			params
		),
		ExpressionAttributeValues: buildConditionAttributeValues(
			KeyCondition,
			params
		),
	};
};
