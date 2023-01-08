import { toString, md5, getAttrName, getAttrValue } from "./utils";

describe("expression helpers", () => {
	it.each([
		["string", "foo", "foo"],
		["number", 2, "2"],
		["boolean", false, "false"],
		["null", null, "null"],
		["undefined", undefined, "undefined"],
		["object", { foo: "bar" }, '{"foo":"bar"}'],
		["array", ["foo", "bar"], '["foo","bar"]'],
		["set of numbers", new Set([1, 2]), "Set([1,2]))"],
		["set of strings", new Set(["foo", "bar"]), 'Set(["foo","bar"]))'],
	])("converts to string - %s", (_, value, expected) => {
		expect.assertions(1);
		const result = toString(value);
		expect(result).toBe(expected);
	});

	it.each([
		["string", "foo", "acbd18db4cc2f85cedef654fccc4a4d8"],
		["number", 2, "c81e728d9d4c2f636f067f89cc14862c"],
		["boolean", false, "68934a3e9455fa72420237eb05902327"],
		["null", null, "37a6259cc0c1dae299a7866489dff0bd"],
		["undefined", undefined, "5e543256c480ac577d30f76f9120eb74"],
		["object", { foo: "bar" }, "9bb58f26192e4ba00f01e2e7b136bbd8"],
		["array", ["foo", "bar"], "1ea13cb52ddd7c90e9f428d1df115d8f"],
		["set of numbers", new Set([1, 2]), "8c627cc9d533e8fa591e2687101cd26b"],
		["set of strings", new Set(["foo"]), "a4c6dd1467761291b805998fe24e60df"],
	])("hashes any value - %s", (_, value, expected) => {
		expect.assertions(1);
		const result = md5(value);
		expect(result).toBe(expected);
	});

	it.each([
		["new attribute", "foo", "#nccc4a4d8"],
		["already encoded", "#foo", "#foo"],
	])("creates expressions attributes names - %s", (_, attrib, expected) => {
		expect.assertions(1);
		const result = getAttrName(attrib);
		expect(result).toBe(expected);
	});

	it.each([
		["new value", "foo", ":vccc4a4d8"],
		["already encoded", ":foo", ":foo"],
	])("creates expressions attributes values - %s", (_, attrib, expected) => {
		expect.assertions(1);
		const result = getAttrValue(attrib);
		expect(result).toBe(expected);
	});
});
