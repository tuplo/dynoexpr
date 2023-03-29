import crypto from "node:crypto";

export function toString(data: unknown) {
	if (data instanceof Set) {
		return `Set(${JSON.stringify(Array.from(data))}))`;
	}

	return typeof data === "object"
		? JSON.stringify(data)
		: `${data}:${typeof data}`;
}

export function md5(data: unknown) {
	return crypto.createHash("md5").update(toString(data).trim()).digest("hex");
}

function md5hash(data: unknown) {
	return md5(data).slice(24);
}

export function unquote(input: string) {
	return input.replace(/^"/, "").replace(/"$/, "");
}

export function splitByDot(input: string) {
	const parts = input.match(/"[^"]+"|[^.]+/g) ?? [];

	return parts.map(unquote);
}

export function getSingleAttrName(attr: string) {
	return `#n${md5hash(attr)}`;
}

export function getAttrName(attribute: string) {
	if (/^#/.test(attribute)) return attribute;

	return splitByDot(attribute).map(getSingleAttrName).join(".");
}

export function getAttrValue(value: unknown) {
	if (typeof value === "string" && /^:/.test(value)) {
		return value;
	}

	return `:v${md5hash(value)}`;
}

export function splitByOperator(operator: string, input: string) {
	const rg = new RegExp(` [${operator}] `, "g");

	return input
		.split(rg)
		.filter((m) => m !== operator)
		.map((m) => m.trim())
		.map(unquote);
}
