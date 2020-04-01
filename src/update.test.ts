/* eslint @typescript-eslint/camelcase:off */
import {
  getExpressionAttributes,
  getUpdateExpression,
  parseOperationValue,
  UpdateInput,
} from './update';

describe(`update expression`, () => {
  it(`parses the number on a math operation update`, () => {
    expect.assertions(6);
    const exprs = [
      `foo + 2`,
      `foo - 2`,
      `2 - foo`,
      `2 + foo`,
      `foo  +  2`,
      `foo+2`,
    ];
    const expected = 2;
    exprs.forEach((exp) => {
      const result = parseOperationValue(exp, `foo`);
      expect(result).toBe(expected);
    });
  });

  it(`converts from an obj to ExpressionAttributes`, () => {
    expect.assertions(1);
    const Update = {
      foo: 'bar',
      baz: 2,
      'foo-bar': 'buz',
      fooBar: 'buzz',
      'foo.bar': 'quz',
      foo_bar: 'qiz',
    };
    const params = { Update };
    const result = getExpressionAttributes(params);
    const expected = {
      Update,
      ExpressionAttributeNames: {
        '#na4d8': 'foo',
        '#n6e88': 'baz',
        '#n9cb1': 'foo-bar',
        '#n5dc0': 'fooBar',
        '#ne022': 'foo.bar',
        '#n5a6e': 'foo_bar',
      },
      ExpressionAttributeValues: {
        ':v51f2': 'bar',
        ':v862c': 2,
        ':v66e7': 'buz',
        ':vfef0': 'buzz',
        ':v11cd': 'quz',
        ':vc4ab': 'qiz',
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it(`builds ExpressionAttributesMap with existing maps`, () => {
    expect.assertions(1);
    const Update = { a: 1 };
    const params = {
      Update,
      ExpressionAttributeNames: { '#b': `b` },
      ExpressionAttributeValues: { ':b': 2 },
    };
    const result = getExpressionAttributes(params);
    const expected = {
      Update,
      ExpressionAttributeNames: { '#b': `b`, '#n2661': `a` },
      ExpressionAttributeValues: { ':b': 2, ':v849b': 1 },
    };
    expect(result).toStrictEqual(expected);
  });

  it(`updates attributes - SET`, () => {
    expect.assertions(1);
    const params = {
      Update: {
        foo: 'bar',
        baz: 2,
      },
    };
    const result = getUpdateExpression(params);
    const expected = {
      UpdateExpression: `SET #na4d8 = :v51f2, #n6e88 = :v862c`,
      ExpressionAttributeNames: {
        '#na4d8': 'foo',
        '#n6e88': 'baz',
      },
      ExpressionAttributeValues: {
        ':v51f2': 'bar',
        ':v862c': 2,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it(`updates numberic value math operations - SET`, () => {
    expect.assertions(1);
    const params: UpdateInput = {
      Update: {
        foo: `foo - 2`,
        bar: `2 - bar`,
        baz: `baz + 9`,
      },
    };
    const result = getUpdateExpression(params);
    const expected = {
      UpdateExpression: `SET #na4d8 = #na4d8 - :v862c, #n51f2 = :v862c - #n51f2, #n6e88 = #n6e88 + :vad26`,
      ExpressionAttributeNames: {
        '#na4d8': 'foo',
        '#n51f2': 'bar',
        '#n6e88': 'baz',
      },
      ExpressionAttributeValues: {
        ':v862c': 2,
        ':vad26': 9,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it(`removes attributes - REMOVE`, () => {
    expect.assertions(1);
    const params: UpdateInput = {
      Update: {
        foo: 'bar',
        baz: 2,
      },
      UpdateAction: 'REMOVE',
    };
    const result = getUpdateExpression(params);
    const expected = {
      UpdateExpression: `REMOVE #na4d8, #n6e88`,
      ExpressionAttributeNames: {
        '#na4d8': 'foo',
        '#n6e88': 'baz',
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it(`updates numeric values or sets - ADD`, () => {
    expect.assertions(1);
    const params: UpdateInput = {
      Update: {
        foo: 'bar',
        baz: 2,
      },
      UpdateAction: `ADD`,
    };
    const result = getUpdateExpression(params);
    const expected = {
      UpdateExpression: `ADD #na4d8 :v51f2, #n6e88 :v862c`,
      ExpressionAttributeNames: {
        '#na4d8': 'foo',
        '#n6e88': 'baz',
      },
      ExpressionAttributeValues: {
        ':v51f2': 'bar',
        ':v862c': 2,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it(`deletes items from sets - DELETE`, () => {
    expect.assertions(1);
    const params: UpdateInput = {
      Update: {
        foo: 'bar',
        baz: 2,
      },
      UpdateAction: `DELETE`,
    };
    const result = getUpdateExpression(params);
    const expected = {
      UpdateExpression: `DELETE #na4d8 :v51f2, #n6e88 :v862c`,
      ExpressionAttributeNames: {
        '#na4d8': 'foo',
        '#n6e88': 'baz',
      },
      ExpressionAttributeValues: {
        ':v51f2': 'bar',
        ':v862c': 2,
      },
    };
    expect(result).toStrictEqual(expected);
  });
});
