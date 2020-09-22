import { DynoexprInput, DynoexprOutput } from 'dynoexpr';
import { getConditionExpression } from '../expressions/condition';
import { getFilterExpression } from '../expressions/filter';
import { getProjectionExpression } from '../expressions/projection';
import { getUpdateExpression } from '../expressions/update';
import { getUpdateOperationsExpression } from '../expressions/update-ops';
import { getKeyConditionExpression } from '../expressions/key-condition';

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

  if (isUpdateRemoveOnlyPresent(params)) {
    delete expression.ExpressionAttributeValues;
  }

  return expression;
}
