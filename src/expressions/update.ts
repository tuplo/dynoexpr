import type {
  DynoexprInputValue,
  UpdateInput,
  UpdateOutput,
} from '../dynoexpr';
import { getAttrName, getAttrValue } from '../utils';

type ParseOperationValueFn = (expr: string, key: string) => number;
export const parseOperationValue: ParseOperationValueFn = (expr, key) => {
  const v = expr.replace(key, '').replace(/[+-]/, '');
  return Number(v.trim());
};

type IsMathExpressionFn = (name: string, value: DynoexprInputValue) => boolean;
export const isMathExpression: IsMathExpressionFn = (name, value) => {
  if (typeof name !== 'string') return false;

  const rgLh = new RegExp(`^${name}\\s*[+-]\\s*\\d+$`);
  const rgRh = new RegExp(`^\\d+\\s*[+-]\\s*${name}$`);

  return rgLh.test(`${value}`) || rgRh.test(`${value}`);
};

export function getListAppendExpressionAttributes(
  key: string,
  value: DynoexprInputValue
) {
  const [, listAppendValues] = /list_append\((.+)\)/.exec(`${value}`) || [];
  const rg = /(\[[^\]]+\])/g;
  return [...listAppendValues.matchAll(rg)]
    .map((m) => m[0])
    .filter((v) => v !== key)
    .join('');
}

export function getListAppendExpression(
  key: string,
  value: DynoexprInputValue
) {
  const attr = getAttrName(key);
  const [, listAppendValues] = /list_append\((.+)\)/.exec(`${value}`) || [];

  const rg = /(\[[^\]]+\])/g;
  const lists = [...listAppendValues.matchAll(rg)].map((m) => m[0]);
  const attrValues: Record<string, string> = {};

  // replace only lists with attrValues
  const newValue = lists.reduce((acc, list) => {
    attrValues[list] = getAttrValue(list);
    return acc.replace(list, attrValues[list]);
  }, listAppendValues as string);

  const vv = newValue
    .split(/,/)
    .map((v) => v.trim())
    .map((v) => (v === key ? attr : v));

  return `${attr} = list_append(${vv.join(', ')})`;
}

type ExpressionAttributesMap = {
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynoexprInputValue };
};
type GetExpressionAttributesFn = (params: UpdateInput) => UpdateOutput;
export const getExpressionAttributes: GetExpressionAttributesFn = (params) => {
  const { Update = {}, UpdateAction = 'SET' } = params;

  return Object.entries(Update).reduce((acc, [key, value]) => {
    if (!acc.ExpressionAttributeNames) acc.ExpressionAttributeNames = {};
    if (!acc.ExpressionAttributeValues) acc.ExpressionAttributeValues = {};

    key.split('.').forEach((k) => {
      acc.ExpressionAttributeNames[getAttrName(k)] = k;
    });

    if (UpdateAction !== 'REMOVE') {
      let v = value;

      if (isMathExpression(key, value)) {
        v = parseOperationValue(value as string, key);
      }

      if (/^if_not_exists/.test(`${value}`)) {
        const [, vv] = /if_not_exists\((.+)\)/.exec(`${value}`) || [];
        v = vv;
      }

      if (/^list_append/.test(`${value}`)) {
        v = getListAppendExpressionAttributes(key, value);
      }

      if (Array.isArray(v) && /ADD|DELETE/.test(UpdateAction)) {
        const s = new Set(v as string[]);
        acc.ExpressionAttributeValues[getAttrValue(s)] = s;
      } else {
        acc.ExpressionAttributeValues[getAttrValue(v)] = v;
      }
    }

    return acc;
  }, params as ExpressionAttributesMap);
};

type GetUpdateExpressionFn = (params?: UpdateInput) => UpdateOutput;
export const getUpdateExpression: GetUpdateExpressionFn = (params = {}) => {
  if (!params.Update) return params;

  const { Update, UpdateAction = 'SET', ...restOfParams } = params;
  const { ExpressionAttributeNames = {}, ExpressionAttributeValues = {} } =
    getExpressionAttributes(params);

  let entries = '';
  switch (UpdateAction) {
    case 'SET':
      entries = Object.entries(Update)
        .map(([name, value]) => {
          if (/^if_not_exists/.test(`${value}`)) {
            const attr = getAttrName(name);
            const [, v] = /if_not_exists\((.+)\)/.exec(`${value}`) || [];
            return `${attr} = if_not_exists(${attr}, ${getAttrValue(v)})`;
          }

          if (/^list_append/.test(`${value}`)) {
            return getListAppendExpression(name, value);
          }

          if (isMathExpression(name, value)) {
            const [, operator] = /([+-])/.exec(value as string) || [];
            const expr = (value as string)
              .split(/[+-]/)
              .map((operand: string) => operand.trim())
              .map((operand: string) => {
                if (operand === name) return getAttrName(name);
                const v = parseOperationValue(operand, name);
                return getAttrValue(v);
              })
              .join(` ${operator} `);

            return `${getAttrName(name)} = ${expr}`;
          }

          return `${getAttrName(name)} = ${getAttrValue(value)}`;
        })
        .join(', ');
      break;
    case 'ADD':
    case 'DELETE':
      entries = Object.entries(Update)
        .map(
          ([name, value]) =>
            [
              name,
              Array.isArray(value) ? new Set(value as unknown[]) : value,
            ] as [string, unknown]
        )
        .map(([name, value]) => [getAttrName(name), getAttrValue(value)])
        .map(([exprName, exprValue]) => `${exprName} ${exprValue}`)
        .join(', ');
      break;
    case 'REMOVE':
      entries = Object.entries(Update)
        .map(([name]) => [getAttrName(name)])
        .join(', ');
      break;
    default:
      break;
  }

  const parameters: UpdateOutput = {
    ...restOfParams,
    UpdateExpression: [UpdateAction, entries].join(' '),
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  };

  return parameters;
};
