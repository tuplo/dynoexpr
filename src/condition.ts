import {
  buildConditionAttributeNames,
  buildConditionAttributeValues,
  buildConditionExpression,
  LogicalOperator,
} from './condition-helpers';
import { DynamoDbValue } from './helpers';

export type Condition = Record<string, DynamoDbValue>;
export type ConditionInput = Partial<{
  Condition?: Condition;
  ConditionLogicalOperator: LogicalOperator;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;
export type ConditionOutput = Partial<{
  ConditionExpression: string;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;

type GetConditionExpressionFn = (params?: ConditionInput) => ConditionOutput;
export const getConditionExpression: GetConditionExpressionFn = (
  params = {}
) => {
  if (!params.Condition) return params;
  const { Condition, ConditionLogicalOperator, ...restOfParams } = params;
  const paramsWithConditions = {
    ...restOfParams,
    ConditionExpression: buildConditionExpression({
      Condition,
      LogicalOperator: ConditionLogicalOperator,
    }),
    ExpressionAttributeNames: buildConditionAttributeNames(Condition, params),
    ExpressionAttributeValues: buildConditionAttributeValues(Condition, params),
  };
  
  if(Object.keys(paramsWithConditions.ExpressionAttributeValues).length === 0) delete paramsWithConditions.ExpressionAttributeValues;
  return paramsWithConditions;
};
