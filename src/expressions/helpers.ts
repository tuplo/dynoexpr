import type {
  LogicalOperatorType,
  DynoexprInputValue,
  DynamoDbValue,
} from '../dynoexpr';
import { getAttrName, getAttrValue } from '../utils';

const REGEX_NOT = /^not\s(.+)/i;
type ParseNotConditionFn = (exp: string) => string;
export const parseNotCondition: ParseNotConditionFn = (exp) => {
  const [, v] = REGEX_NOT.exec(exp) || [];
  return v.trim();
};

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

const REGEX_BETWEEN = /^between\s+(.+)\s+and\s+(.+)/i;
type ParseBetweenValueFn = (exp: string) => (string | number)[];
export const parseBetweenValue: ParseBetweenValueFn = (exp) => {
  const vs = REGEX_BETWEEN.exec(exp) || [];
  return vs
    .slice(1, 3)
    .map((val) => val.trim())
    .map((val) => (/^\d+$/.test(val) ? Number(val) : val));
};

const REGEX_COMPARISON = /^[>=<]+\s*(.+)/;
type ParseComparisonValueFn = (exp: string) => string | number;
export const parseComparisonValue: ParseComparisonValueFn = (exp) => {
  const [, v] = REGEX_COMPARISON.exec(exp) || [];
  const sv = v.trim();
  return /^\d+$/.test(sv) ? Number(sv) : sv;
};

const REGEX_PARSE_IN = /^in\s*\(([^)]+)/i;
type ParseInValueFn = (exp: string) => (string | number)[];
export const parseInValue: ParseInValueFn = (exp) => {
  const [, list] = REGEX_PARSE_IN.exec(exp) || [];
  return list
    .split(',')
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

type FlattenExpressionsFn = (
  Condition: Record<string, DynoexprInputValue>
) => [string, DynoexprInputValue][];
export const flattenExpressions: FlattenExpressionsFn = (Condition) =>
  Object.entries(Condition).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((v: DynoexprInputValue) => [key, v]);
    }
    return [[key, value]];
  }) as [string, DynoexprInputValue][];

type BuildConditionExpressionInput = {
  Condition: Record<string, DynoexprInputValue>;
  LogicalOperator?: LogicalOperatorType;
};
type BuildConditionExpressionFn = (
  params: BuildConditionExpressionInput
) => string;
export const buildConditionExpression: BuildConditionExpressionFn = ({
  Condition = {},
  LogicalOperator = 'AND',
}) =>
  flattenExpressions(Condition)
    .map(([key, value]) => {
      let expr: string;
      if (typeof value === 'string') {
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
          expr = `${getAttrName(key)} in (${v.map(getAttrValue).join(',')})`;
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
        expr = [hasNotCondition && 'not', expr].filter(Boolean).join(' ');
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
  condition: Record<string, DynoexprInputValue>,
  params?: ConditionAttributeNamesParams
) => { [key: string]: string };
export const buildConditionAttributeNames: BuildConditionAttributeNamesFn = (
  condition,
  params = {}
) =>
  Object.keys(condition).reduce((acc, key) => {
    key.split('.').forEach((k) => {
      acc[getAttrName(k)] = k;
    });
    return acc;
  }, params.ExpressionAttributeNames || ({} as { [key: string]: string }));

export type ConditionAttributeValuesParams = {
  ExpressionAttributeValues?: { [key: string]: DynamoDbValue };
};
type BuildConditionAttributeValuesFn = (
  condition: Record<string, DynoexprInputValue>,
  params?: ConditionAttributeValuesParams
) => { [key: string]: DynamoDbValue };
export const buildConditionAttributeValues: BuildConditionAttributeValuesFn = (
  condition,
  params = {}
) =>
  flattenExpressions(condition).reduce((acc, [, value]) => {
    let v: DynamoDbValue | undefined;
    if (typeof value === 'string') {
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

    if (typeof v === 'undefined') {
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
