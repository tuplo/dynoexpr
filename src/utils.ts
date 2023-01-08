import crypto from "node:crypto";

type ToStringFn = (data: unknown) => string;
export const toString: ToStringFn = (data) => {
	if (data instanceof Set) {
		return `Set(${JSON.stringify(Array.from(data))}))`;
	}

	return typeof data === "object" ? JSON.stringify(data) : `${data}`;
};

type Md5Fn = (data: unknown) => string;
export const md5: Md5Fn = (data) =>
	crypto.createHash("md5").update(toString(data).trim()).digest("hex");

function md5hash(data: unknown) {
	return md5(data).slice(24);
}

type GetAttrNameFn = (attribute: string) => string;
export const getAttrName: GetAttrNameFn = (attribute) => {
	if (/^#/.test(attribute)) return attribute;

	return attribute
		.split(".")
		.map((attr) => `#n${md5hash(attr)}`)
		.join(".");
};

type GetAttrValueFn = (value: unknown) => string;
export const getAttrValue: GetAttrValueFn = (value) => {
	if (typeof value === "string" && /^:/.test(value)) return value;

	return `:v${md5hash(value)}`;
};
