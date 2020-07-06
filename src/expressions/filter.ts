import { FilterInput, FilterOutput } from 'dynoexpr';
import {
  buildConditionAttributeNames,
  buildConditionAttributeValues,
  buildConditionExpression,
} from './helpers';

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
