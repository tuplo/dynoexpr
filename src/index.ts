import type {
	IBatchRequestInput,
	IDynoexprInput,
	IDynoexprOutput,
	ITransactRequestInput,
} from "./dynoexpr.d";

import { getBatchExpressions, isBatchRequest } from "./operations/batch";
import { getSingleTableExpressions } from "./operations/single";
import {
	getTransactExpressions,
	isTransactRequest,
} from "./operations/transact";
import { AwsSdkDocumentClient } from "./document-client";

export type {
	IBatchRequestInput,
	IDynoexprInput,
	IDynoexprOutput,
	ITransactRequestInput,
};

export interface IDynoexprArgs
	extends Partial<IDynoexprInput>,
		Partial<IBatchRequestInput>,
		Partial<ITransactRequestInput> {
	DocumentClient?: unknown;
}

function cleanOutput<T>(output: unknown) {
	const { DocumentClient, ...restOfOutput } = (output || {}) as {
		[key: string]: unknown;
	};

	return restOfOutput as T;
}

function dynoexpr<T = IDynoexprOutput>(args: IDynoexprArgs): T {
	if (args.DocumentClient) {
		AwsSdkDocumentClient.setDocumentClient(args.DocumentClient);
	}

	let returns: unknown;

	if (isBatchRequest(args)) {
		returns = getBatchExpressions(args) as IDynoexprOutput;
	}

	if (isTransactRequest(args)) {
		returns = getTransactExpressions(args) as IDynoexprOutput;
	}

	returns = getSingleTableExpressions(args);

	return cleanOutput<T>(returns);
}

export default dynoexpr;
