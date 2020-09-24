import type { DynoexprFn } from './dynoexpr';

import { getSingleTableExpressions } from './operations/single';
import { isBatchRequest, getBatchExpressions } from './operations/batch';
import {
  isTransactRequest,
  getTransactExpressions,
} from './operations/transact';

const dynoexpr: DynoexprFn = (params) => {
  if (isBatchRequest(params)) {
    return getBatchExpressions(params);
  }
  if (isTransactRequest(params)) {
    return getTransactExpressions(params);
  }
  return getSingleTableExpressions(params);
};

export default dynoexpr;
