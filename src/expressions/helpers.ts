import type {
	IDynamoDbValue,
	IDynoexprInputValue,
	ILogicalOperatorType,
} from "src/dynoexpr.d";

import { getAttrName, getAttrValue } from "../utils";

type IValue = string | boolean | number | null;
export function convertValue(value: string): IValue {
	const v = value.trim();
	if (v === "null") return null;
	if (/^true$|^false$/i.test(v)) return v === "true";
	if (/^[0-9.]+$/.test(v)) return Number(v);
	return v;
}

const REGEX_NOT = /^not\s(.+)/i;
export function parseNotCondition(exp: string) {
	const [, v] = REGEX_NOT.exec(exp) || [];
	return v.trim();
}

const REGEX_ATTRIBUTE_TYPE = /^attribute_type\s*\(([^)]+)/i;
export function parseAttributeTypeValue(exp: string) {
	const [, v] = REGEX_ATTRIBUTE_TYPE.exec(exp) || [];
	return convertValue(v);
}

const REGEX_BEGINS_WITH = /^begins_with[ |(]+([^)]+)/i;
export function parseBeginsWithValue(exp: string) {
	const [, v] = REGEX_BEGINS_WITH.exec(exp) || [];
	return convertValue(v);
}

const REGEX_BETWEEN = /^between\s+(.+)\s+and\s+(.+)/i;
export function parseBetweenValue(exp: string) {
	const vs = REGEX_BETWEEN.exec(exp) || [];
	return vs.slice(1, 3).map(convertValue);
}

const REGEX_COMPARISON = /^[>=<]+\s*(.+)/;
export function parseComparisonValue(exp: string) {
	const [, v] = REGEX_COMPARISON.exec(exp) || [];
	const sv = v.trim();
	return convertValue(sv);
}

const REGEX_PARSE_IN = /^in\s*\(([^)]+)/i;
type ParseInValueFn = (exp: string) => IValue[];
export const parseInValue: ParseInValueFn = (exp) => {
	const [, list] = REGEX_PARSE_IN.exec(exp) || [];
	return list.split(",").map(convertValue);
};

const REGEX_SIZE = /^size\s*[<=>]+\s*(\d+)/i;
export function parseSizeValue(exp: string) {
	const [, v] = REGEX_SIZE.exec(exp) || [];
	return convertValue(v);
}

const REGEX_CONTAINS = /^contains\s*\(([^)]+)\)/i;
export function parseContainsValue(exp: string) {
	const [, v] = REGEX_CONTAINS.exec(exp) || [];
	return convertValue(v);
}

const REGEX_ATTRIBUTE_EXISTS = /^attribute_exists$/i;
const REGEX_ATTRIBUTE_NOT_EXISTS = /^attribute_not_exists$/i;

export function flattenExpressions(
	Condition: Record<string, IDynoexprInputValue>
) {
	return Object.entries(Condition).flatMap(([key, value]) => {
		if (Array.isArray(value)) {
			return value.map((v: IDynoexprInputValue) => [key, v]);
		}

		return [[key, value]];
	}) as [string, IDynoexprInputValue][];
}

interface IBuildConditionExpressionArgs {
	Condition: Record<string, IDynoexprInputValue>;
	LogicalOperator?: ILogicalOperatorType;
}

export function buildConditionExpression(args: IBuildConditionExpressionArgs) {
	const { Condition = {}, LogicalOperator = "AND" } = args;

	return flattenExpressions(Condition)
		.map(([key, value]) => {
			let expr: string;
			if (typeof value === "string") {
				let strValue = value.trim();

				const hasNotCondition = REGEX_NOT.test(strValue);
				if (hasNotCondition) {
					strValue = parseNotCondition(strValue);
				}

				if (REGEX_COMPARISON.test(strValue)) {
					const [, operator] = /([<=>]+)/.exec(strValue) || [];
					const v = parseComparisonValue(strValue);
					expr = `${getAttrName(key)} ${operator} ${getAttrValue(v)}`;
				} else if (REGEX_BETWEEN.test(strValue)) {
					const v = parseBetweenValue(strValue);
					const exp = `between ${getAttrValue(v[0])} and ${getAttrValue(v[1])}`;
					expr = `${getAttrName(key)} ${exp}`;
				} else if (REGEX_PARSE_IN.test(strValue)) {
					const v = parseInValue(strValue);
					expr = `${getAttrName(key)} in (${v.map(getAttrValue).join(",")})`;
				} else if (REGEX_ATTRIBUTE_EXISTS.test(strValue)) {
					expr = `attribute_exists(${getAttrName(key)})`;
				} else if (REGEX_ATTRIBUTE_NOT_EXISTS.test(strValue)) {
					expr = `attribute_not_exists(${getAttrName(key)})`;
				} else if (REGEX_ATTRIBUTE_TYPE.test(strValue)) {
					const v = parseAttributeTypeValue(strValue);
					expr = `attribute_type(${getAttrName(key)},${getAttrValue(v)})`;
				} else if (REGEX_BEGINS_WITH.test(strValue)) {
					const v = parseBeginsWithValue(strValue);
					expr = `begins_with(${getAttrName(key)},${getAttrValue(v)})`;
				} else if (REGEX_CONTAINS.test(strValue)) {
					const v = parseContainsValue(strValue);
					expr = `contains(${getAttrName(key)},${getAttrValue(v)})`;
				} else if (REGEX_SIZE.test(strValue)) {
					const [, operator] = /([<=>]+)/.exec(strValue) || [];
					const v = parseSizeValue(strValue);
					expr = `size(${getAttrName(key)}) ${operator} ${getAttrValue(v)}`;
				} else {
					expr = `${getAttrName(key)} = ${getAttrValue(strValue)}`;
				}

				// adds NOT condition if it exists
				expr = [hasNotCondition && "not", expr].filter(Boolean).join(" ");
			} else {
				expr = `${getAttrName(key)} = ${getAttrValue(value)}`;
			}

			return expr;
		})
		.map((expr) => `(${expr})`)
		.join(` ${LogicalOperator} `);
}

export interface IConditionAttributeNamesParams {
	ExpressionAttributeNames?: { [key: string]: string };
}

export function buildConditionAttributeNames(
	condition: Record<string, IDynoexprInputValue>,
	params: IConditionAttributeNamesParams = {}
) {
	return Object.keys(condition).reduce((acc, key) => {
		key.split(".").forEach((k) => {
			acc[getAttrName(k)] = k;
		});
		return acc;
	}, params.ExpressionAttributeNames || ({} as { [key: string]: string }));
}

export interface IConditionAttributeValuesParams {
	ExpressionAttributeValues?: { [key: string]: IDynamoDbValue };
}

export function buildConditionAttributeValues(
	condition: Record<string, IDynoexprInputValue>,
	params: IConditionAttributeValuesParams = {}
) {
	return flattenExpressions(condition).reduce((acc, [, value]) => {
		let v: IDynamoDbValue | undefined;
		if (typeof value === "string") {
			let strValue = value.trim();

			const hasNotCondition = REGEX_NOT.test(strValue);
			if (hasNotCondition) {
				strValue = parseNotCondition(strValue);
			}

			if (REGEX_COMPARISON.test(strValue)) {
				v = parseComparisonValue(strValue);
			} else if (REGEX_BETWEEN.test(strValue)) {
				v = parseBetweenValue(strValue);
			} else if (REGEX_PARSE_IN.test(strValue)) {
				v = parseInValue(strValue);
			} else if (REGEX_ATTRIBUTE_TYPE.test(strValue)) {
				v = parseAttributeTypeValue(strValue);
			} else if (REGEX_BEGINS_WITH.test(strValue)) {
				v = parseBeginsWithValue(strValue);
			} else if (REGEX_CONTAINS.test(strValue)) {
				v = parseContainsValue(strValue);
			} else if (REGEX_SIZE.test(strValue)) {
				v = parseSizeValue(strValue);
			} else if (
				!REGEX_ATTRIBUTE_EXISTS.test(strValue) &&
				!REGEX_ATTRIBUTE_NOT_EXISTS.test(strValue)
			) {
				v = strValue;
			}
		} else {
			v = value;
		}

		if (typeof v === "undefined") {
			return acc;
		}

		if (Array.isArray(v)) {
			v.forEach((val) => {
				acc[getAttrValue(val)] = val;
			});
		} else {
			acc[getAttrValue(v)] = v;
		}

		return acc;
	}, params.ExpressionAttributeValues || ({} as { [key: string]: IDynamoDbValue }));
}
