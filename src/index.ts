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

export { ConditionInput, ConditionOutput } from './condition';
export { FilterInput, FilterOutput } from './filter';
export { KeyConditionInput, KeyConditionOutput } from './key-condition';
export { ProjectionInput, ProjectionOutput } from './projection';
export { UpdateInput, UpdateOutput } from './update';

export type DynoexprInput = Partial<
  ConditionInput &
    FilterInput &
    KeyConditionInput &
    ProjectionInput &
    UpdateInput
> &
  unknown;

export type DynoexprOutput = Partial<
  ConditionOutput &
    FilterOutput &
    KeyConditionOutput &
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
