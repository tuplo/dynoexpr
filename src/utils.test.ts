import { toString, md5, getAttrName, getAttrValue } from './utils';

describe('expression helpers', () => {
  it('converts to string', () => {
    expect.assertions(7);
    const values = ['foo', 2, false, null, undefined, { foo: 'bar' }, ['foo']];
    const expected = [
      'foo',
      '2',
      'false',
      'null',
      'undefined',
      '{"foo":"bar"}',
      '["foo"]',
    ];
    values.forEach((value, i) => {
      const result = toString(value);
      expect(result).toBe(expected[i]);
    });
  });

  it('hashes any value', () => {
    expect.assertions(7);
    const values = ['foo', 2, false, null, undefined, { foo: 'bar' }, ['foo']];
    const expected = [
      'acbd18db4cc2f85cedef654fccc4a4d8',
      'c81e728d9d4c2f636f067f89cc14862c',
      '68934a3e9455fa72420237eb05902327',
      '37a6259cc0c1dae299a7866489dff0bd',
      '5e543256c480ac577d30f76f9120eb74',
      '9bb58f26192e4ba00f01e2e7b136bbd8',
      'a0cc55529e8a5748afb69ba8ebeebad8',
    ];
    values.forEach((value, i) => {
      const result = md5(value);
      expect(result).toBe(expected[i]);
    });
  });

  it("creates expressions attributes' names", () => {
    expect.assertions(2);
    const attribs = ['foo', '#foo'];
    const expected = ['#na4d8', '#foo'];
    attribs.forEach((attrib, i) => {
      const result = getAttrName(attrib);
      expect(result).toBe(expected[i]);
    });
  });

  it("creates expressions attributes' values", () => {
    expect.assertions(2);
    const attribs = ['foo', ':foo'];
    const expected = [':va4d8', ':foo'];
    attribs.forEach((attrib, i) => {
      const result = getAttrValue(attrib);
      expect(result).toBe(expected[i]);
    });
  });
});
