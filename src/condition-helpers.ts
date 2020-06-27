import { getAttrName, getAttrValue, DynamoDbValue } from './helpers';

const REGEX_ATTRIBUTE_TYPE = /^attribute_type\s*\(([^)]+)/i;
type ParseAttributeTypeValue = (exp: string) => string;
export const parseAttributeTypeValue: ParseAttributeTypeValue = (exp) => {
  const [, v] = REGEX_ATTRIBUTE_TYPE.exec(exp) || [];
  return v.trim();
};

const REGEX_BEGINS_WITH = /^begins_with[ |(]+([^)]+)/i;
type ParseBeginsWithValueFn = (exp: string) => string;
export const parseBeginsWithValue: ParseBeginsWithValueFn = (exp) => {
  const [, v] = REGEX_BEGINS_WITH.exec(exp) || [];
  return v.trim();
};

const REGEX_BETWEEN = /^between\s+(\d+)\s+and\s+(\d+)/i;
type ParseBetweenValueFn = (exp: string) => number[];
export const parseBetweenValue: ParseBetweenValueFn = (exp) => {
  const vs = REGEX_BETWEEN.exec(exp) || [];
  return vs
    .slice(1, 3)
    .map((val) => val.trim())
    .map((val) => Number(val));
};

const REGEX_COMPARISON = /^[>=<]+\s*(\d+)/;
type ParseComparisonValueFn = (exp: string) => number;
export const parseComparisonValue: ParseComparisonValueFn = (exp) => {
  const [, v] = REGEX_COMPARISON.exec(exp) || [];
  return Number(v.trim());
};

const REGEX_PARSE_IN = /^in\s*\(([^)]+)/i;
type ParseInValueFn = (exp: string) => (string | number)[];
export const parseInValue: ParseInValueFn = (exp) => {
  const [, list] = REGEX_PARSE_IN.exec(exp) || [];
  return list
    .split(`,`)
    .map((el) => el.trim())
    .map((el) => (/^\d+$/.test(el) ? Number(el) : el));
};

const REGEX_SIZE = /^size\s*[<=>]+\s*(\d+)/i;
type ParseSizeValueFn = (exp: string) => number;
export const parseSizeValue: ParseSizeValueFn = (exp) => {
  const [, v] = REGEX_SIZE.exec(exp) || [];
  return Number(v.trim());
};

const REGEX_CONTAINS = /^contains\s*\(([^)]+)\)/i;
type ParseContainsValueFn = (exp: string) => string;
export const parseContainsValue: ParseContainsValueFn = (exp) => {
  const [, v] = REGEX_CONTAINS.exec(exp) || [];
  return v.trim();
};

const REGEX_ATTRIBUTE_EXISTS = /^attribute_exists$/i;
const REGEX_ATTRIBUTE_NOT_EXISTS = /^attribute_not_exists$/i;

export type LogicalOperator = 'AND' | 'OR';
type BuildConditionExpressionInput = {
  Condition: Record<string, DynamoDbValue>;
  LogicalOperator?: LogicalOperator;
};
type BuildConditionExpressionFn = (
  params: BuildConditionExpressionInput
) => string;
export const buildConditionExpression: BuildConditionExpressionFn = ({
  Condition = {},
  LogicalOperator = 'AND',
}) =>
  Object.entries(Condition)
    .map(([key, value]) => {
      let expr: string;
      if (typeof value === `string`) {
        const strValue = value.trim();
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
          expr = `${getAttrName(key)} in (${v.map(getAttrValue).join(`,`)})`;
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
      } else {
        expr = `${getAttrName(key)} = ${getAttrValue(value)}`;
      }
      return expr;
    })
    .map((expr) => `(${expr})`)
    .join(` ${LogicalOperator} `);

export type ConditionAttributeNamesParams = {
  ExpressionAttributeNames?: { [key: string]: string };
};
type BuildConditionAttributeNamesFn = (
  condition: Record<string, DynamoDbValue>,
  params?: ConditionAttributeNamesParams
) => { [key: string]: string };
export const buildConditionAttributeNames: BuildConditionAttributeNamesFn = (
  condition,
  params = {}
) =>
  Object.keys(condition).reduce((acc, key) => {
    acc[getAttrName(key)] = key;
    return acc;
  }, params.ExpressionAttributeNames || ({} as { [key: string]: string }));

export type ConditionAttributeValuesParams = {
  ExpressionAttributeValues?: { [key: string]: DynamoDbValue };
};
type BuildConditionAttributeValuesFn = (
  condition: Record<string, DynamoDbValue>,
  params?: ConditionAttributeValuesParams
) => { [key: string]: DynamoDbValue };
export const buildConditionAttributeValues: BuildConditionAttributeValuesFn = (
  condition,
  params = {}
) =>
  Object.entries(condition).reduce((acc, [, value]) => {
    let v: DynamoDbValue | undefined;
    if (typeof value === `string`) {
      const strValue = value.trim();
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

    if (typeof v === `undefined`) {
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
  }, params.ExpressionAttributeValues || ({} as { [key: string]: DynamoDbValue }));
