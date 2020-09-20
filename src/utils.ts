import crypto from 'crypto';

type ToStringFn = (data: unknown) => string;
export const toString: ToStringFn = (data) =>
  typeof data === 'object' ? JSON.stringify(data) : `${data}`;

type Md5Fn = (data: unknown) => string;
export const md5: Md5Fn = (data) => {
  return crypto.createHash('md5').update(toString(data).trim()).digest('hex');
};

type GetAttrNameFn = (attribute: string) => string;
export const getAttrName: GetAttrNameFn = (attribute) => {
  if (/^#/.test(attribute)) return attribute;
  return `#n${md5(attribute).substr(28)}`;
};

type GetAttrValueFn = (value: unknown) => string;
export const getAttrValue: GetAttrValueFn = (value) => {
  if (typeof value === 'string' && /^:/.test(value)) return value;
  return `:v${md5(value).substr(28)}`;
};
