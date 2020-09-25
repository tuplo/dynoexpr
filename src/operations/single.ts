import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import type { DynoexprInput, DynamoDbValue, DynoexprOutput } from '../dynoexpr';
import { getConditionExpression } from '../expressions/condition';
import { getFilterExpression } from '../expressions/filter';
import { getProjectionExpression } from '../expressions/projection';
import { getUpdateExpression } from '../expressions/update';
import { getUpdateOperationsExpression } from '../expressions/update-ops';
import { getKeyConditionExpression } from '../expressions/key-condition';

const docClient = new DocumentClient();

type IsUpdateRemoveOnlyPresentFn = (params: DynoexprInput) => boolean;
export const isUpdateRemoveOnlyPresent: IsUpdateRemoveOnlyPresentFn = (
  params
) => {
  const { UpdateAction, UpdateRemove } = params;
  if (UpdateAction !== 'REMOVE' && typeof UpdateRemove === 'undefined')
    return false;

  const { Condition, Filter, KeyCondition } = params;
  const otherPresent = [Condition, Filter, KeyCondition].some(
    (key) => typeof key !== 'undefined'
  );
  if (otherPresent) {
    return false;
  }

  return true;
};

type ConvertValuesToDynamoDbSetFn = (
  attributeValues: Record<string, unknown>
) => Record<string, DynamoDbValue>;
export const convertValuesToDynamoDbSet: ConvertValuesToDynamoDbSetFn = (
  attributeValues
) => {
  return Object.entries(attributeValues).reduce((acc, [key, value]) => {
    if (value instanceof Set) {
      acc[key] = docClient.createSet(Array.from(value));
    } else {
      acc[key] = value as DynamoDbValue;
    }
    return acc;
  }, {} as Record<string, DynamoDbValue>);
};

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

  if (isUpdateRemoveOnlyPresent(params)) {
    delete expression.ExpressionAttributeValues;
  }

  return expression;
}
