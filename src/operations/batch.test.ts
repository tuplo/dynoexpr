import { getBatchExpressions } from './batch';

describe('batch requests', () => {
  it('accepts batch operations: batchGet', () => {
    expect.assertions(1);
    const params = {
      RequestItems: {
        'Table-1': {
          Keys: [{ foo: 'bar' }],
          Projection: ['a', 'b'],
        },
        'Table-2': {
          Keys: [{ foo: 'bar' }],
          Projection: ['foo', 'cast', 'year', 'baz'],
          ExpressionAttributeNames: {
            '#quz': 'quz',
          },
        },
      },
    };
    const result = getBatchExpressions(params);

    const expected = {
      RequestItems: {
        'Table-1': {
          Keys: [{ foo: 'bar' }],
          ProjectionExpression: '#n2661,#n578f',
          ExpressionAttributeNames: {
            '#n2661': 'a',
            '#n578f': 'b',
          },
        },
        'Table-2': {
          Keys: [{ foo: 'bar' }],
          ProjectionExpression: '#na4d8,#nc464,#n17d8,#n6e88',
          ExpressionAttributeNames: {
            '#quz': 'quz',
            '#na4d8': 'foo',
            '#nc464': 'cast',
            '#n17d8': 'year',
            '#n6e88': 'baz',
          },
        },
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it('accepts batch operations: batchWrite', () => {
    expect.assertions(1);
    const params = {
      RequestItems: {
        'Table-1': [{ DeleteRequest: { Key: { foo: 'bar' } } }],
        'Table-2': [{ PutRequest: { Key: { foo: 'bar' } } }],
        'Table-3': [
          { PutRequest: { Item: { baz: 'buz' } } },
          { PutRequest: { Item: { biz: 'quz' } } },
        ],
        'Table-4': [
          { DeleteRequest: { Item: { baz: 'buz' } } },
          { DeleteRequest: { Item: { biz: 'quz' } } },
        ],
        'Table-5': [
          { PutRequest: { Item: { baz: 'buz' } } },
          { DeleteRequest: { Item: { biz: 'quz' } } },
        ],
      },
    };
    const result = getBatchExpressions(params);

    expect(result).toStrictEqual(params);
  });
});
