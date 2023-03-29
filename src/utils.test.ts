import {
	getAttrName,
	getAttrValue,
	md5,
	splitByDot,
	splitByOperator,
	toString,
	unquote,
} from "./utils";

describe("expression helpers", () => {
	it.each([
		["string", "foo", "foo:string"],
		["number", 2, "2:number"],
		["boolean", false, "false:boolean"],
		["null", null, "null"],
		["undefined", undefined, "undefined:undefined"],
		["object", { foo: "bar" }, '{"foo":"bar"}'],
		["array", ["foo", "bar"], '["foo","bar"]'],
		["set of numbers", new Set([1, 2]), "Set([1,2]))"],
		["set of strings", new Set(["foo", "bar"]), 'Set(["foo","bar"]))'],
	])("converts to string - %s", (_, value, expected) => {
		const result = toString(value);
		expect(result).toBe(expected);
	});

	it.each([
		["string", "foo", "50160593616221462b570f645f0025bb"],
		["number", 2, "8203d52a3428fce53b2d8b84aeeabc63"],
		["boolean", false, "5c6c5c6ca9032dd615c9d4ef976fa742"],
		["null", null, "37a6259cc0c1dae299a7866489dff0bd"],
		["undefined", undefined, "311128a3ab878d27e98b4f68914aa64e"],
		["object", { foo: "bar" }, "9bb58f26192e4ba00f01e2e7b136bbd8"],
		["array", ["foo", "bar"], "1ea13cb52ddd7c90e9f428d1df115d8f"],
		["set of numbers", new Set([1, 2]), "8c627cc9d533e8fa591e2687101cd26b"],
		["set of strings", new Set(["foo"]), "a4c6dd1467761291b805998fe24e60df"],
	])("hashes any value - %s", (_, value, expected) => {
		const result = md5(value);
		expect(result).toBe(expected);
	});

	it.each([
		['"foobar"', "foobar"],
		['"foobar', "foobar"],
		['foobar"', "foobar"],
	])("unquote: %s", (input, expected) => {
		const actual = unquote(input);
		expect(actual).toBe(expected);
	});

	it.each([
		["foo.bar.baz", ["foo", "bar", "baz"]],
		['foo."bar.buz".baz', ["foo", "bar.buz", "baz"]],
		['foo."bar.buz.baz"', ["foo", "bar.buz.baz"]],
		['"foo.bar.buz".baz', ["foo.bar.buz", "baz"]],
		['"foo.bar.buz.baz"', ["foo.bar.buz.baz"]],
	])("split by dot: %s", (input, expected) => {
		const actual = splitByDot(input);
		expect(actual).toStrictEqual(expected);
	});

	it.each([
		["new attribute", "foo", "#n5f0025bb"],
		["already encoded", "#foo", "#foo"],
		["object keys", "object.key.value", "#nbb017076.#nefd6a199.#n10d6f4c5"],
		[
			"object keys",
			'object."key.with-chars".value',
			"#nbb017076.#n0327a04a.#n10d6f4c5",
		],
	])("creates expressions attributes names: %s", (_, attrib, expected) => {
		const result = getAttrName(attrib);
		expect(result).toBe(expected);
	});

	it.each([
		["new value", "foo", ":v5f0025bb"],
		["already encoded", ":foo", ":foo"],
	])("creates expressions attributes values: %s", (_, attrib, expected) => {
		const result = getAttrValue(attrib);
		expect(result).toBe(expected);
	});

	it.each([
		["+", "foo + 1", ["foo", "1"]],
		["+", "1 + foo", ["1", "foo"]],
		["-", "foo - 1", ["foo", "1"]],
		["-", "1 - foo", ["1", "foo"]],
		["+", "foo.bar + 1", ["foo.bar", "1"]],
		["+", "1 + foo.bar", ["1", "foo.bar"]],
		["-", "foo.bar - 1", ["foo.bar", "1"]],
		["-", "1 - foo.bar", ["1", "foo.bar"]],
		["+", "foo.bar.baz + 1", ["foo.bar.baz", "1"]],
		["+", "1 + foo.bar.baz", ["1", "foo.bar.baz"]],
		["-", "foo.bar.baz - 1", ["foo.bar.baz", "1"]],
		["-", "1 - foo.bar.baz", ["1", "foo.bar.baz"]],
		["+", 'foo."bar+buz".baz + 1', ['foo."bar+buz".baz', "1"]],
		["+", '1 + foo."bar+buz".baz', ["1", 'foo."bar+buz".baz']],
		["-", 'foo."bar+buz".baz - 1', ['foo."bar+buz".baz', "1"]],
		["-", '1 - foo."bar+buz".baz', ["1", 'foo."bar+buz".baz']],
		["+", 'foo."bar-buz".baz + 1', ['foo."bar-buz".baz', "1"]],
		["+", '1 + foo."bar-buz".baz', ["1", 'foo."bar-buz".baz']],
		["-", 'foo."bar-buz".baz - 1', ['foo."bar-buz".baz', "1"]],
		["-", '1 - foo."bar-buz".baz', ["1", 'foo."bar-buz".baz']],
	])("split by operator: %s, %s", (operator, input, expected) => {
		const actual = splitByOperator(operator, input);
		expect(actual).toStrictEqual(expected);
	});
});
