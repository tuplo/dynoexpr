import type {
  DynoexprInput,
  BatchRequestInput,
  TransactRequestInput,
  DynoexprOutput,
} from './dynoexpr';

import { getSingleTableExpressions } from './operations/single';
import { isBatchRequest, getBatchExpressions } from './operations/batch';
import {
  isTransactRequest,
  getTransactExpressions,
} from './operations/transact';

type DynoexprParams = DynoexprInput | BatchRequestInput | TransactRequestInput;

function dynoexpr<T = DynoexprOutput>(params: DynoexprParams): T {
  if (isBatchRequest(params)) {
    return getBatchExpressions(params) as DynoexprOutput as T;
  }
  if (isTransactRequest(params)) {
    return getTransactExpressions(params) as DynoexprOutput as T;
  }

  return getSingleTableExpressions(params) as T;
}

export default dynoexpr;
