/* eslint-disable no-param-reassign */
import type {
	DynoexprInput,
	BatchRequestInput,
	BatchRequestOutput,
	BatchRequestItemsInput,
	BatchGetInput,
	BatchWriteInput,
} from "../dynoexpr";
import { getSingleTableExpressions } from "./single";

export function isBatchRequest(
	params: DynoexprInput | BatchRequestInput
): params is BatchRequestInput {
	return "RequestItems" in params;
}

function isBatchGetRequest(
	tableParams: BatchGetInput | BatchWriteInput[]
): tableParams is BatchGetInput {
	return !Array.isArray(tableParams);
}

function isBatchWriteRequest(
	tableParams: BatchGetInput | BatchWriteInput[]
): tableParams is BatchWriteInput {
	if (!Array.isArray(tableParams)) return false;
	const [firstTable] = tableParams;
	return "DeleteRequest" in firstTable || "PutRequest" in firstTable;
}

export function getBatchExpressions<
	T extends BatchRequestOutput = BatchRequestOutput
>(params: BatchRequestInput): T {
	return {
		...params,
		RequestItems: Object.entries(params.RequestItems).reduce(
			(accParams, [tableName, tableParams]) => {
				if (isBatchGetRequest(tableParams)) {
					accParams[tableName] = getSingleTableExpressions(tableParams);
				}
				if (isBatchWriteRequest(tableParams)) {
					accParams[tableName] = tableParams;
				}
				return accParams;
			},
			{} as BatchRequestItemsInput
		),
	} as T;
}
