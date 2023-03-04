import type {
	IBatchRequestInput,
	IDynoexprInput,
	IDynoexprOutput,
	ITransactRequestInput,
} from "src/dynoexpr.d";

import { getBatchExpressions, isBatchRequest } from "./operations/batch";
import { getSingleTableExpressions } from "./operations/single";
import {
	getTransactExpressions,
	isTransactRequest,
} from "./operations/transact";

type IDynoexprParams =
	| IDynoexprInput
	| IBatchRequestInput
	| ITransactRequestInput;

function dynoexpr<T = IDynoexprOutput>(params: IDynoexprParams): T {
	if (isBatchRequest(params)) {
		return getBatchExpressions(params) as IDynoexprOutput as T;
	}
	if (isTransactRequest(params)) {
		return getTransactExpressions(params) as IDynoexprOutput as T;
	}

	return getSingleTableExpressions(params) as T;
}

export default dynoexpr;
