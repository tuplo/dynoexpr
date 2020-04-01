import {
  ConditionInput,
  ConditionOutput,
  getConditionExpression,
} from './condition';
import { getFilterExpression, FilterInput, FilterOutput } from './filter';
import {
  getProjectionExpression,
  ProjectionInput,
  ProjectionOutput,
} from './projection';
import { getUpdateExpression, UpdateInput, UpdateOutput } from './update';
import {
  getKeyConditionExpression,
  KeyConditionInput,
  KeyConditionOutput,
} from './key-condition';

export type DynoexprInput = Partial<
  KeyConditionInput &
    ConditionInput &
    FilterInput &
    ProjectionInput &
    UpdateInput
> &
  unknown;

export type DynoexprOutput = Partial<
  KeyConditionOutput &
    ConditionOutput &
    FilterOutput &
    ProjectionOutput &
    UpdateOutput
> &
  unknown;

export default function dynoexpr<T extends DynoexprOutput = DynoexprOutput>(
  params: DynoexprInput = {}
): T {
  return [
    getKeyConditionExpression,
    getConditionExpression,
    getFilterExpression,
    getProjectionExpression,
    getUpdateExpression,
  ].reduce((acc, getExpressionFn) => getExpressionFn(acc), params) as T;
}
