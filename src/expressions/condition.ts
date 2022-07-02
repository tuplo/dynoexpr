import type { ConditionInput, ConditionOutput } from '../dynoexpr';
import {
	buildConditionAttributeNames,
	buildConditionAttributeValues,
	buildConditionExpression,
} from './helpers';

type GetConditionExpressionFn = (params?: ConditionInput) => ConditionOutput;
export const getConditionExpression: GetConditionExpressionFn = (
	params = {}
) => {
	if (!params.Condition) return params;
	const { Condition, ConditionLogicalOperator, ...restOfParams } = params;
	const paramsWithConditions: ConditionOutput = {
		...restOfParams,
		ConditionExpression: buildConditionExpression({
			Condition,
			LogicalOperator: ConditionLogicalOperator,
		}),
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
};
