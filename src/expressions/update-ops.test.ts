import type { UpdateInput } from '../dynoexpr';
import {
  getUpdateSetExpression,
  getUpdateRemoveExpression,
  getUpdateAddExpression,
  getUpdateDeleteExpression,
  getUpdateOperationsExpression,
} from './update-ops';

describe('update operations - SET/REMOVE/ADD/DELETE', () => {
  it('builds a SET update expression', () => {
    expect.assertions(1);
    const params: UpdateInput = {
      UpdateSet: {
        foo: 'foo - 2',
        bar: '2 - bar',
        baz: 'baz + 9',
        bez: [1, 2, 3],
        buz: { biz: 3 },
        boz: [{ qux: 2 }],
      },
    };
    const result = getUpdateSetExpression(params);
    const expected = {
      UpdateExpression:
        'SET #na4d8 = #na4d8 - :v862c, #n51f2 = :v862c - #n51f2, #n6e88 = #n6e88 + :vad26, #n7aa0 = :vc2b7, #n66e7 = :v2362, #neeac = :v5650',
      ExpressionAttributeNames: {
        '#na4d8': 'foo',
        '#n51f2': 'bar',
        '#n6e88': 'baz',
        '#n7aa0': 'bez',
        '#n66e7': 'buz',
        '#neeac': 'boz',
      },
      ExpressionAttributeValues: {
        ':v862c': 2,
        ':vad26': 9,
        ':v2362': { biz: 3 },
        ':v5650': [{ qux: 2 }],
        ':vc2b7': [1, 2, 3],
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it('builds a REMOVE update expression', () => {
    expect.assertions(1);
    const params: UpdateInput = {
      UpdateRemove: {
        foo: 'bar',
        baz: 2,
      },
    };
    const result = getUpdateRemoveExpression(params);
    const expected = {
      UpdateExpression: 'REMOVE #na4d8, #n6e88',
      ExpressionAttributeNames: {
        '#na4d8': 'foo',
        '#n6e88': 'baz',
      },
      ExpressionAttributeValues: {},
    };
    expect(result).toStrictEqual(expected);
  });

  it('builds an ADD update expression', () => {
    expect.assertions(1);
    const params: UpdateInput = {
      UpdateAdd: {
        foo: 'bar',
        baz: 2,
        bez: [1, 2, 3],
        buz: { biz: 3 },
        boz: [{ qux: 2 }],
      },
    };
    const result = getUpdateAddExpression(params);
    const expected = {
      UpdateExpression:
        'ADD #na4d8 :v51f2, #n6e88 :v862c, #n7aa0 :v646d, #n66e7 :v2362, #neeac :v77e7',
      ExpressionAttributeNames: {
        '#na4d8': 'foo',
        '#n6e88': 'baz',
        '#n66e7': 'buz',
        '#n7aa0': 'bez',
        '#neeac': 'boz',
      },
      ExpressionAttributeValues: {
        ':v51f2': 'bar',
        ':v862c': 2,
        ':v2362': { biz: 3 },
        ':v77e7': new Set([{ qux: 2 }]),
        ':v646d': new Set([1, 2, 3]),
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it('builds a DELETE update expression', () => {
    expect.assertions(1);
    const params: UpdateInput = {
      UpdateDelete: {
        foo: 'bar',
        baz: 2,
        bez: [1, 2, 3],
        buz: { biz: 3 },
        boz: [{ qux: 2 }],
      },
    };
    const result = getUpdateDeleteExpression(params);
    const expected = {
      UpdateExpression:
        'DELETE #na4d8 :v51f2, #n6e88 :v862c, #n7aa0 :v646d, #n66e7 :v2362, #neeac :v77e7',
      ExpressionAttributeNames: {
        '#n66e7': 'buz',
        '#n6e88': 'baz',
        '#n7aa0': 'bez',
        '#na4d8': 'foo',
        '#neeac': 'boz',
      },
      ExpressionAttributeValues: {
        ':v2362': { biz: 3 },
        ':v51f2': 'bar',
        ':v862c': 2,
        ':v77e7': new Set([{ qux: 2 }]),
        ':v646d': new Set([1, 2, 3]),
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it('builds multiple update expressions', () => {
    expect.assertions(1);
    const params: UpdateInput = {
      UpdateSet: { ufoo: 'ufoo - 2' },
      UpdateRemove: { rfoo: 'rbar' },
      UpdateAdd: { afoo: 'abar' },
      UpdateDelete: { dfoo: 'dbar' },
    };
    const result = getUpdateOperationsExpression(params);
    const expected = {
      UpdateExpression:
        'SET #nff12 = #nff12 - :v862c REMOVE #n978b ADD #nb01c :ve948 DELETE #nd358 :v45cc',
      ExpressionAttributeNames: {
        '#n978b': 'rfoo',
        '#nb01c': 'afoo',
        '#nd358': 'dfoo',
        '#nff12': 'ufoo',
      },
      ExpressionAttributeValues: {
        ':v45cc': 'dbar',
        ':v862c': 2,
        ':ve948': 'abar',
      },
    };
    expect(result).toStrictEqual(expected);
  });
});
