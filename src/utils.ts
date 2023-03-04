import crypto from "node:crypto";

export function toString(data: unknown) {
	if (data instanceof Set) {
		return `Set(${JSON.stringify(Array.from(data))}))`;
	}

	return typeof data === "object" ? JSON.stringify(data) : `${data}`;
}

export function md5(data: unknown) {
	return crypto.createHash("md5").update(toString(data).trim()).digest("hex");
}

function md5hash(data: unknown) {
	return md5(data).slice(24);
}

export function getAttrName(attribute: string) {
	if (/^#/.test(attribute)) return attribute;

	return attribute
		.split(".")
		.map((attr) => `#n${md5hash(attr)}`)
		.join(".");
}

export function getAttrValue(value: unknown) {
	if (typeof value === "string" && /^:/.test(value)) {
		return value;
	}

	return `:v${md5hash(value)}`;
}
