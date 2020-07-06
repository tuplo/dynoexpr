import { DynoexprInput, DynoexprOutput } from 'dynoexpr';
import { getConditionExpression } from '../expressions/condition';
import { getFilterExpression } from '../expressions/filter';
import { getProjectionExpression } from '../expressions/projection';
import { getUpdateExpression } from '../expressions/update';
import { getKeyConditionExpression } from '../expressions/key-condition';

export function getSingleTableExpressions<
  T extends DynoexprOutput = DynoexprOutput
>(params: DynoexprInput = {}): T {
  return [
    getKeyConditionExpression,
    getConditionExpression,
    getFilterExpression,
    getProjectionExpression,
    getUpdateExpression,
  ].reduce((acc, getExpressionFn) => getExpressionFn(acc), params) as T;
}
