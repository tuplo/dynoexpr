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
    acc.ExpressionAttributeNames[getAttrName(key)] = key;
    if (UpdateAction !== 'REMOVE') {
      const v = isMathExpression(key, value)
        ? parseOperationValue(value as string, key)
        : value;
      acc.ExpressionAttributeValues[getAttrValue(v)] =
        Array.isArray(v) && /ADD|DELETE/.test(UpdateAction)
          ? new Set(v as string[])
          : v;
    }
    return acc;
  }, params as ExpressionAttributesMap);
};

type GetUpdateExpressionFn = (params?: UpdateInput) => UpdateOutput;
export const getUpdateExpression: GetUpdateExpressionFn = (params = {}) => {
  if (!params.Update) return params;
  const { Update, UpdateAction = 'SET', ...restOfParams } = params;
  const {
    ExpressionAttributeNames = {},
    ExpressionAttributeValues = {},
  } = getExpressionAttributes(params);
  let entries = '';
  switch (UpdateAction) {
    case 'SET':
      entries = Object.entries(Update)
        .map(([name, value]) => {
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
