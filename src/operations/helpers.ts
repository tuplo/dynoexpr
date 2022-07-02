import type { DynoexprOutput } from '../dynoexpr';

export function trimEmptyExpressionAttributes<
	T extends DynoexprOutput = DynoexprOutput
>(expression: T): T {
	const trimmed = { ...expression };
	const { ExpressionAttributeNames, ExpressionAttributeValues } = expression;

	if (Object.keys(ExpressionAttributeNames || {}).length === 0) {
		delete trimmed.ExpressionAttributeNames;
	}

	if (Object.keys(ExpressionAttributeValues || {}).length === 0) {
		delete trimmed.ExpressionAttributeValues;
	}

	return trimmed;
}
