import { getAttrName, getAttrValue, DynamoDbValue } from './helpers';

type ParseAttributeTypeValue = (exp: string) => string;
export const parseAttributeTypeValue: ParseAttributeTypeValue = (exp) => {
  const [, v] = /^attribute_type\s*\(([^)]+)/i.exec(exp) || [];
  return v.trim();
};

type ParseBeginsWithValueFn = (exp: string) => string;
export const parseBeginsWithValue: ParseBeginsWithValueFn = (exp) => {
  const [, v] = /^begins_with\s*\(?([^)]+)/i.exec(exp) || [];
  return v.trim();
};

type ParseBetweenValueFn = (exp: string) => number[];
export const parseBetweenValue: ParseBetweenValueFn = (exp) => {
  const vs = /^between\s+(\d+)\s+and\s+(\d+)/i.exec(exp) || [];
  return vs
    .slice(1, 3)
    .map((val) => val.trim())
    .map((val) => Number(val));
};

type ParseComparisonValueFn = (exp: string) => number;
export const parseComparisonValue: ParseComparisonValueFn = (exp) => {
  const [, v] = /^[>=<]+\s*(\d+)/.exec(exp) || [];
  return Number(v.trim());
};

type ParseInValueFn = (exp: string) => (string | number)[];
export const parseInValue: ParseInValueFn = (exp) => {
  const [, list] = /^in\s*\(([^)]+)/i.exec(exp) || [];
  return list
    .split(`,`)
    .map((el) => el.trim())
    .map((el) => (/^\d+$/.test(el) ? Number(el) : el));
};

type ParseSizeValueFn = (exp: string) => number;
export const parseSizeValue: ParseSizeValueFn = (exp) => {
  const [, v] = /[<=>]+\s*(\d+)/.exec(exp) || [];
  return Number(v.trim());
};

type ParseContainsValueFn = (exp: string) => string;
export const parseContainsValue: ParseContainsValueFn = (exp) => {
  const [, v] = /^contains\s*\(([^)]+)\)/i.exec(exp) || [];
  return v.trim();
};

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
        if (/^[>=<]/.test(value)) {
          const [, operator] = /([<=>]+)/.exec(value) || [];
          const v = parseComparisonValue(value);
          expr = `${getAttrName(key)} ${operator} ${getAttrValue(v)}`;
        } else if (/^between/i.test(value)) {
          const v = parseBetweenValue(value);
          const exp = `between ${getAttrValue(v[0])} and ${getAttrValue(v[1])}`;
          expr = `${getAttrName(key)} ${exp}`;
        } else if (/^in/i.test(value)) {
          const v = parseInValue(value);
          expr = `${getAttrName(key)} in (${v.map(getAttrValue).join(`,`)})`;
        } else if (/^attribute_exists/i.test(value)) {
          expr = `attribute_exists(${getAttrName(key)})`;
        } else if (/^attribute_not_exists/i.test(value)) {
          expr = `attribute_not_exists(${getAttrName(key)})`;
        } else if (/^attribute_type/i.test(value)) {
          const v = parseAttributeTypeValue(value);
          expr = `attribute_type(${getAttrName(key)},${getAttrValue(v)})`;
        } else if (/^begins_with/i.test(value)) {
          const v = parseBeginsWithValue(value);
          expr = `begins_with(${getAttrName(key)},${getAttrValue(v)})`;
        } else if (/^contains/i.test(value)) {
          const v = parseContainsValue(value);
          expr = `contains(${getAttrName(key)},${getAttrValue(v)})`;
        } else if (/^size/i.test(value)) {
          const [, operator] = /([<=>]+)/.exec(value) || [];
          const v = parseSizeValue(value);
          expr = `size(${getAttrName(key)}) ${operator} ${getAttrValue(v)}`;
        } else {
          expr = `${getAttrName(key)} = ${getAttrValue(value)}`;
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
      if (/^[>=<]/.test(value)) {
        v = parseComparisonValue(value);
      } else if (/^between/i.test(value)) {
        v = parseBetweenValue(value);
      } else if (/^in/i.test(value)) {
        v = parseInValue(value);
      } else if (/^attribute_type/i.test(value)) {
        v = parseAttributeTypeValue(value);
      } else if (/^begins_with/i.test(value)) {
        v = parseBeginsWithValue(value);
      } else if (/^contains/i.test(value)) {
        v = parseContainsValue(value);
      } else if (/^size/i.test(value)) {
        v = parseSizeValue(value);
      } else if (!/^attribute_exists|^attribute_not_exists/.test(value)) {
        v = value;
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
