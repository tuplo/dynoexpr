import {
  buildConditionAttributeNames,
  buildConditionAttributeValues,
  buildConditionExpression,
  LogicalOperator,
} from './condition-helpers';
import { DynamoDbValue } from './helpers';

export type Filter = Record<string, DynamoDbValue>;
export type FilterInput = Partial<{
  Filter: Filter;
  FilterLogicalOperator: LogicalOperator;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;
export type FilterOutput = Partial<{
  FilterExpression: string;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;

type GetFilterExpressionFn = (params?: FilterInput) => FilterOutput;
export const getFilterExpression: GetFilterExpressionFn = (params = {}) => {
  if (!params.Filter) return params;
  const { Filter, FilterLogicalOperator, ...restOfParams } = params;
  return {
    ...restOfParams,
    FilterExpression: buildConditionExpression({
      Condition: Filter,
      LogicalOperator: FilterLogicalOperator,
    }),
    ExpressionAttributeNames: buildConditionAttributeNames(Filter, params),
    ExpressionAttributeValues: buildConditionAttributeValues(Filter, params),
  };
};
