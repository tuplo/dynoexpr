import type { TransactRequestInput } from '../dynoexpr';

import { getTransactExpressions } from './transact';

describe('transact requests', () => {
  it('accepts transact operations - transactGet', () => {
    expect.assertions(1);
    const params = {
      TransactItems: [
        {
          Get: {
            TableName: 'Table-1',
            Key: { id: 'foo' },
            Projection: ['a', 'b'],
          },
        },
        {
          Get: {
            TableName: 'Table-2',
            Key: { id: 'bar' },
            Projection: ['foo', 'cast', 'year', 'baz'],
            ExpressionAttributeNames: {
              '#quz': 'quz',
            },
          },
        },
      ],
      ReturnConsumedCapacity: 'INDEXES',
    } as TransactRequestInput;
    const result = getTransactExpressions(params);

    const expected = {
      TransactItems: [
        {
          Get: {
            TableName: 'Table-1',
            Key: { id: 'foo' },
            ProjectionExpression: '#n2661,#n578f',
            ExpressionAttributeNames: {
              '#n2661': 'a',
              '#n578f': 'b',
            },
          },
        },
        {
          Get: {
            TableName: 'Table-2',
            Key: { id: 'bar' },
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
      ],
      ReturnConsumedCapacity: 'INDEXES',
    };
    expect(result).toStrictEqual(expected);
  });

  it('accepts transact operations - transactWrite', () => {
    expect.assertions(1);
    const params = {
      TransactItems: [
        {
          ConditionCheck: {
            TableName: 'Table-1',
            Condition: { a: 'foo' },
          },
        },
        {
          Put: {
            TableName: 'Table-1',
            Condition: { b: '> 1' },
          },
        },
        {
          Delete: {
            TableName: 'Table-2',
            Condition: { c: '>= 2' },
          },
        },
        {
          Update: {
            TableName: 'Table-3',
            Update: { foo: 'bar' },
          },
        },
      ],
      ReturnConsumedCapacity: 'INDEXES',
    };
    const result = getTransactExpressions(params);

    const expected = {
      ReturnConsumedCapacity: 'INDEXES',
      TransactItems: [
        {
          ConditionCheck: {
            ConditionExpression: '(#n2661 = :va4d8)',
            ExpressionAttributeNames: {
              '#n2661': 'a',
            },
            ExpressionAttributeValues: {
              ':va4d8': 'foo',
            },
            TableName: 'Table-1',
          },
        },
        {
          Put: {
            ConditionExpression: '(#n578f > :v849b)',
            ExpressionAttributeNames: {
              '#n578f': 'b',
            },
            ExpressionAttributeValues: {
              ':v849b': 1,
            },
            TableName: 'Table-1',
          },
        },
        {
          Delete: {
            ConditionExpression: '(#n5f33 >= :v862c)',
            ExpressionAttributeNames: {
              '#n5f33': 'c',
            },
            ExpressionAttributeValues: {
              ':v862c': 2,
            },
            TableName: 'Table-2',
          },
        },
        {
          Update: {
            ExpressionAttributeNames: {
              '#na4d8': 'foo',
            },
            ExpressionAttributeValues: {
              ':v51f2': 'bar',
            },
            TableName: 'Table-3',
            UpdateExpression: 'SET #na4d8 = :v51f2',
          },
        },
      ],
    };
    expect(result).toStrictEqual(expected);
  });
});
