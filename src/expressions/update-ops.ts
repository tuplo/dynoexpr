import type { UpdateInput, UpdateOutput } from 'dynoexpr';
import { getUpdateExpression } from './update';

type GetUpdateExpressionFn = (params?: UpdateInput) => UpdateOutput;

export const getUpdateSetExpression: GetUpdateExpressionFn = (params = {}) => {
  const { UpdateSet, ...restOfParams } = params;
  return getUpdateExpression({
    ...restOfParams,
    Update: UpdateSet,
    UpdateAction: 'SET',
  });
};

export const getUpdateRemoveExpression: GetUpdateExpressionFn = (
  params = {}
) => {
  const { UpdateRemove, ...restOfParams } = params;
  return getUpdateExpression({
    ...restOfParams,
    Update: UpdateRemove,
    UpdateAction: 'REMOVE',
  });
};

export const getUpdateAddExpression: GetUpdateExpressionFn = (params = {}) => {
  const { UpdateAdd, ...restOfParams } = params;
  return getUpdateExpression({
    ...restOfParams,
    Update: UpdateAdd,
    UpdateAction: 'ADD',
  });
};

export const getUpdateDeleteExpression: GetUpdateExpressionFn = (
  params = {}
) => {
  const { UpdateDelete, ...restOfParams } = params;
  return getUpdateExpression({
    ...restOfParams,
    Update: UpdateDelete,
    UpdateAction: 'DELETE',
  });
};

export const getUpdateOperationsExpression: GetUpdateExpressionFn = (
  params = {}
) => {
  const updateExpressions: string[] = [];
  const outputParams = [
    getUpdateSetExpression,
    getUpdateRemoveExpression,
    getUpdateAddExpression,
    getUpdateDeleteExpression,
  ].reduce((acc, getExpressionFn) => {
    const expr = getExpressionFn(acc);
    const { UpdateExpression = '' } = expr;
    updateExpressions.push(UpdateExpression);
    return expr;
  }, params as UpdateOutput);

  const aggUpdateExpression = updateExpressions
    .filter(Boolean)
    .filter((e, i, a) => a.indexOf(e) === i)
    .join(' ');
  if (aggUpdateExpression) {
    outputParams.UpdateExpression = aggUpdateExpression;
  }

  return outputParams;
};
