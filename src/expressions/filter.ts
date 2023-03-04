import type { IFilterInput } from "src/dynoexpr.d";

import {
	buildConditionAttributeNames,
	buildConditionAttributeValues,
	buildConditionExpression,
} from "./helpers";

export function getFilterExpression(params: IFilterInput = {}) {
	if (!params.Filter) {
		return params;
	}

	const { Filter, FilterLogicalOperator, ...restOfParams } = params;

	const FilterExpression = buildConditionExpression({
		Condition: Filter,
		LogicalOperator: FilterLogicalOperator,
	});

	const ExpressionAttributeNames = buildConditionAttributeNames(Filter, params);

	const ExpressionAttributeValues = buildConditionAttributeValues(
		Filter,
		params
	);

	return {
		...restOfParams,
		FilterExpression,
		ExpressionAttributeNames,
		ExpressionAttributeValues,
	};
}
