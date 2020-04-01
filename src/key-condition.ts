import {
  buildConditionAttributeNames,
  buildConditionAttributeValues,
  buildConditionExpression,
  LogicalOperator,
} from './condition-helpers';
import { DynamoDbValue } from './helpers';

export type KeyCondition = Record<string, DynamoDbValue>;
export type KeyConditionInput = Partial<{
  KeyCondition: KeyCondition;
  KeyConditionLogicalOperator: LogicalOperator;
  ExpressionAttributeNames: Record<string, string>;
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;
export type KeyConditionOutput = Partial<{
  KeyConditionExpression: string;
  ExpressionAttributeNames: Record<string, string>;
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;
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
