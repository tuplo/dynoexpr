import type {
	IDynoexprInput,
	ITransactOperation,
	ITransactRequestInput,
	ITransactRequestOutput,
} from "src/dynoexpr.d";

import { getSingleTableExpressions } from "./single";

export function isTransactRequest(
	params: IDynoexprInput | ITransactRequestInput
): params is ITransactRequestInput {
	return "TransactItems" in params;
}

export function getTransactExpressions<
	T extends ITransactRequestOutput = ITransactRequestOutput
>(params: ITransactRequestInput): T {
	const TransactItems = params.TransactItems.map((tableItems) => {
		const [key] = Object.keys(tableItems) as ITransactOperation[];
		return {
			[key]: getSingleTableExpressions(tableItems[key]),
		};
	});

	return {
		...params,
		TransactItems,
	} as T;
}
