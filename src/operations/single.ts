import { AwsSdkDocumentClient } from "src/document-client";
import type {
	IDynamoDbValue,
	IDynoexprInput,
	IDynoexprOutput,
} from "src/dynoexpr.d";

import { getConditionExpression } from "../expressions/condition";
import { getFilterExpression } from "../expressions/filter";
import { getKeyConditionExpression } from "../expressions/key-condition";
import { getProjectionExpression } from "../expressions/projection";
import { getUpdateExpression } from "../expressions/update";
import { getUpdateOperationsExpression } from "../expressions/update-ops";

import { trimEmptyExpressionAttributes } from "./helpers";

export function convertValuesToDynamoDbSet(
	attributeValues: Record<string, unknown>
) {
	return Object.entries(attributeValues).reduce((acc, [key, value]) => {
		if (value instanceof Set) {
			const sdk = new AwsSdkDocumentClient();
			acc[key] = sdk.createSet(Array.from(value));
		} else {
			acc[key] = value as IDynamoDbValue;
		}
		return acc;
	}, {} as Record<string, IDynamoDbValue>);
}

export function getSingleTableExpressions<
	T extends IDynoexprOutput = IDynoexprOutput
>(params: IDynoexprInput = {}): T {
	const expression = [
		getKeyConditionExpression,
		getConditionExpression,
		getFilterExpression,
		getProjectionExpression,
		getUpdateExpression,
		getUpdateOperationsExpression,
	].reduce((acc, getExpressionFn) => getExpressionFn(acc), params) as T;

	delete expression.Update;
	delete expression.UpdateAction;

	const { ExpressionAttributeValues = {} } = expression;
	if (Object.keys(ExpressionAttributeValues).length > 0) {
		expression.ExpressionAttributeValues = convertValuesToDynamoDbSet(
			ExpressionAttributeValues
		);
	}

	return trimEmptyExpressionAttributes(expression);
}
