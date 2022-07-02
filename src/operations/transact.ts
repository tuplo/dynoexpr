import type {
	DynoexprInput,
	TransactRequestInput,
	TransactRequestOutput,
	TransactOperation,
} from '../dynoexpr';
import { getSingleTableExpressions } from './single';

export function isTransactRequest(
	params: DynoexprInput | TransactRequestInput
): params is TransactRequestInput {
	return 'TransactItems' in params;
}

export function getTransactExpressions<
	T extends TransactRequestOutput = TransactRequestOutput
>(params: TransactRequestInput): T {
	return {
		...params,
		TransactItems: params.TransactItems.map((tableItems) => {
			const [key] = Object.keys(tableItems) as TransactOperation[];
			return {
				[key]: getSingleTableExpressions(tableItems[key]),
			};
		}),
	} as T;
}
