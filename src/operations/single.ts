import { DocumentClient } from "aws-sdk/clients/dynamodb";

import type { DynoexprInput, DynamoDbValue, DynoexprOutput } from "../dynoexpr";
import { getConditionExpression } from "../expressions/condition";
import { getFilterExpression } from "../expressions/filter";
import { getProjectionExpression } from "../expressions/projection";
import { getUpdateExpression } from "../expressions/update";
import { getUpdateOperationsExpression } from "../expressions/update-ops";
import { getKeyConditionExpression } from "../expressions/key-condition";

import { trimEmptyExpressionAttributes } from "./helpers";

export const createDynamoDbSet =
	DocumentClient.prototype.createSet.bind(undefined);

type ConvertValuesToDynamoDbSetFn = (
	attributeValues: Record<string, unknown>
) => Record<string, DynamoDbValue>;
export const convertValuesToDynamoDbSet: ConvertValuesToDynamoDbSetFn = (
	attributeValues
) =>
	Object.entries(attributeValues).reduce((acc, [key, value]) => {
		if (value instanceof Set) {
			acc[key] = createDynamoDbSet(Array.from(value));
		} else {
			acc[key] = value as DynamoDbValue;
		}
		return acc;
	}, {} as Record<string, DynamoDbValue>);

export function getSingleTableExpressions<
	T extends DynoexprOutput = DynoexprOutput
>(params: DynoexprInput = {}): T {
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
