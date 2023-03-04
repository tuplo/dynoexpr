import type { IUpdateInput, IUpdateOutput } from "src/dynoexpr.d";

import { getUpdateExpression } from "./update";

export function getUpdateSetExpression(params?: IUpdateInput) {
	const { UpdateSet, ...restOfParams } = params || {};

	return getUpdateExpression({
		...restOfParams,
		Update: UpdateSet,
		UpdateAction: "SET",
	});
}

export function getUpdateRemoveExpression(params?: IUpdateInput) {
	const { UpdateRemove, ...restOfParams } = params || {};

	return getUpdateExpression({
		...restOfParams,
		Update: UpdateRemove,
		UpdateAction: "REMOVE",
	});
}

export function getUpdateAddExpression(params?: IUpdateInput) {
	const { UpdateAdd, ...restOfParams } = params || {};

	return getUpdateExpression({
		...restOfParams,
		Update: UpdateAdd,
		UpdateAction: "ADD",
	});
}

export function getUpdateDeleteExpression(params?: IUpdateInput) {
	const { UpdateDelete, ...restOfParams } = params || {};

	return getUpdateExpression({
		...restOfParams,
		Update: UpdateDelete,
		UpdateAction: "DELETE",
	});
}

export function getUpdateOperationsExpression(params: IUpdateInput = {}) {
	const updateExpressions: unknown[] = [];
	const outputParams = [
		getUpdateSetExpression,
		getUpdateRemoveExpression,
		getUpdateAddExpression,
		getUpdateDeleteExpression,
	].reduce((acc, getExpressionFn) => {
		const expr = getExpressionFn(acc);
		const { UpdateExpression = "" } = expr;
		updateExpressions.push(UpdateExpression);
		return expr;
	}, params as IUpdateOutput);

	const aggUpdateExpression = updateExpressions
		.filter(Boolean)
		.filter((e, i, a) => a.indexOf(e) === i)
		.join(" ");
	if (aggUpdateExpression) {
		outputParams.UpdateExpression = aggUpdateExpression;
	}

	return outputParams;
}
