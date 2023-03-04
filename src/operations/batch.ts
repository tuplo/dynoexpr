/* eslint-disable no-param-reassign */
import type {
	IDynoexprInput,
	IBatchRequestInput,
	IBatchRequestOutput,
	IBatchRequestItemsInput,
	IBatchGetInput,
	IBatchWriteInput,
} from "src/dynoexpr.d";

import { getSingleTableExpressions } from "./single";

export function isBatchRequest(
	params: IDynoexprInput | IBatchRequestInput
): params is IBatchRequestInput {
	return "RequestItems" in params;
}

function isBatchGetRequest(
	tableParams: IBatchGetInput | IBatchWriteInput[]
): tableParams is IBatchGetInput {
	return !Array.isArray(tableParams);
}

function isBatchWriteRequest(
	tableParams: IBatchGetInput | IBatchWriteInput[]
): tableParams is IBatchWriteInput[] {
	if (!Array.isArray(tableParams)) {
		return false;
	}

	const [firstTable] = tableParams;
	return "DeleteRequest" in firstTable || "PutRequest" in firstTable;
}

export function getBatchExpressions<
	T extends IBatchRequestOutput = IBatchRequestOutput
>(params: IBatchRequestInput): T {
	const RequestItems = Object.entries(params.RequestItems).reduce(
		(accParams, [tableName, tableParams]) => {
			if (isBatchGetRequest(tableParams)) {
				accParams[tableName] = getSingleTableExpressions(tableParams);
			}

			if (isBatchWriteRequest(tableParams)) {
				accParams[tableName] = tableParams;
			}

			return accParams;
		},
		{} as IBatchRequestItemsInput
	);

	return {
		...params,
		RequestItems,
	} as T;
}
