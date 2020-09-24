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
      },
    };
    const result = getUpdateSetExpression(params);
    const expected = {
      UpdateExpression:
        'SET #na4d8 = #na4d8 - :v862c, #n51f2 = :v862c - #n51f2, #n6e88 = #n6e88 + :vad26',
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
      ExpressionAttributeValues: {
        ':v51f2': 'bar',
        ':v862c': 2,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it('builds an ADD update expression', () => {
    expect.assertions(1);
    const params: UpdateInput = {
      UpdateAdd: {
        foo: 'bar',
        baz: 2,
      },
    };
    const result = getUpdateAddExpression(params);
    const expected = {
      UpdateExpression: 'ADD #na4d8 :v51f2, #n6e88 :v862c',
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

  it('builds a DELETE update expression', () => {
    expect.assertions(1);
    const params: UpdateInput = {
      UpdateDelete: {
        foo: 'bar',
        baz: 2,
      },
    };
    const result = getUpdateDeleteExpression(params);
    const expected = {
      UpdateExpression: 'DELETE #na4d8 :v51f2, #n6e88 :v862c',
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
        'SET #nff12 = #nff12 - :v862c REMOVE #nff12, #n978b ADD #nb01c :ve948 DELETE #nd358 :v45cc',
      ExpressionAttributeNames: {
        '#n978b': 'rfoo',
        '#nb01c': 'afoo',
        '#nd358': 'dfoo',
        '#nff12': 'ufoo',
      },
      ExpressionAttributeValues: {
        ':v0e91': 'rbar',
        ':v45cc': 'dbar',
        ':v862c': 2,
        ':ve948': 'abar',
      },
    };
    expect(result).toStrictEqual(expected);
  });
});
