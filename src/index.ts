/* eslint-disable @typescript-eslint/indent */
import {
  DynoexprInput,
  DynoexprOutput,
  BatchRequestInput,
  BatchRequestOutput,
  TransactRequestInput,
  TransactRequestOutput,
} from 'dynoexpr';
import { getSingleTableExpressions } from './operations/single';
import { isBatchRequest, getBatchExpressions } from './operations/batch';
import {
  isTransactRequest,
  getTransactExpressions,
} from './operations/transact';

/**
 * Converts a plain object to a AWS.DynamoDB.DocumentClient expression.
 * @example
 * const params = dynoexpr({
 *  Filter: { color: 'blue' },
 *  Projection: ['weight', 'quantity']
 * })
 */
export default function dynoexpr<
  T extends
    | DynoexprOutput
    | BatchRequestOutput
    | TransactRequestOutput = DynoexprOutput
>(params: DynoexprInput | BatchRequestInput | TransactRequestInput = {}): T {
  if (isBatchRequest(params)) {
    return getBatchExpressions(params) as T;
  }
  if (isTransactRequest(params)) {
    return getTransactExpressions(params) as T;
  }
  return getSingleTableExpressions(params);
}
