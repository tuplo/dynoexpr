import AWS from 'aws-sdk';

import { DynoexprInput, DynoexprOutput } from 'dynoexpr';
import {
  getSingleTableExpressions,
  isUpdateRemoveOnlyPresent,
  convertValuesToDynamoDbSet,
} from './single';

const docClient = new AWS.DynamoDB.DocumentClient();

describe('single table operations', () => {
  it('applies consecutive expression getters to a parameters object', () => {
    expect.assertions(1);
    const params: DynoexprInput = {
      KeyCondition: { c: 5 },
      Condition: { b: '> 10' },
      Filter: { a: 'foo' },
      Projection: ['a', 'b'],
      UpdateSet: { d: 7 },
      UpdateAdd: { e: 8 },
      UpdateDelete: { f: 9 },
      UpdateRemove: { g: 'g' },
    };
    const result = getSingleTableExpressions(params);
    const expected: DynoexprOutput = {
      KeyConditionExpression: '(#n5f33 = :v18d5)',
      ConditionExpression: '(#n578f > :ve820)',
      FilterExpression: '(#n2661 = :va4d8)',
      ProjectionExpression: '#n2661,#n578f',
      UpdateExpression:
        'SET #n91ad = :v2543 REMOVE #n5f33, #n578f, #n2661, #n91ad, #n845d ADD #nec32 :v236d DELETE #ncce7 :vad26',
      ExpressionAttributeNames: {
        '#n2661': 'a',
        '#n578f': 'b',
        '#n5f33': 'c',
        '#n845d': 'g',
        '#n91ad': 'd',
        '#ncce7': 'f',
        '#nec32': 'e',
      },
      ExpressionAttributeValues: {
        ':v18d5': 5,
        ':v236d': 8,
        ':v2543': 7,
        ':v845d': 'g',
        ':va4d8': 'foo',
        ':vad26': 9,
        ':ve820': 10,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it.each<[string, DynoexprInput, boolean]>([
    ['no update remove', { Filter: { foo: 2 } }, false],
    ['UpdateRemove only', { UpdateRemove: { foo: 1 } }, true],
    [
      'UpdateAction: REMOVE',
      { Update: { foo: 1 }, UpdateAction: 'REMOVE' },
      true,
    ],
    [
      'other expressions',
      { UpdateRemove: { foo: 1 }, Filter: { bar: 2 } },
      false,
    ],
    [
      "don't include Projection",
      { UpdateRemove: { foo: 1 }, Projection: ['bar'] },
      true,
    ],
  ])('checks if only UpdateRemove is present - %s', (_, params, expected) => {
    const result = isUpdateRemoveOnlyPresent(params);
    expect(result).toBe(expected);
  });

  it.each<[string, DynoexprInput, DynoexprOutput]>([
    [
      'UpdateRemove',
      { UpdateRemove: { a: '' } },
      {
        UpdateExpression: 'REMOVE #n2661',
        ExpressionAttributeNames: {
          '#n2661': 'a',
        },
      },
    ],
    [
      "UpdateAction: 'REMOVE'",
      { Update: { a: '' }, UpdateAction: 'REMOVE' },
      {
        UpdateExpression: 'REMOVE #n2661',
        ExpressionAttributeNames: {
          '#n2661': 'a',
        },
      },
    ],
  ])(
    "doesn't include ExpressionAttributeValues - %s",
    (_, params, expected) => {
      expect.assertions(1);
      const result = getSingleTableExpressions(params);
      expect(result).toStrictEqual(expected);
    }
  );

  it("doesn't clash values for different expressions", () => {
    expect.assertions(1);
    const params: DynoexprInput = {
      KeyCondition: { a: 5 },
      Condition: { a: '> 10' },
      Filter: { a: 2 },
      Projection: ['a', 'b'],
      UpdateSet: { a: 2 },
    };
    const result = getSingleTableExpressions(params);
    const expected: DynoexprOutput = {
      KeyConditionExpression: '(#n2661 = :v18d5)',
      ConditionExpression: '(#n2661 > :ve820)',
      FilterExpression: '(#n2661 = :v862c)',
      ProjectionExpression: '#n2661,#n578f',
      UpdateExpression: 'SET #n2661 = :v862c',
      ExpressionAttributeNames: {
        '#n2661': 'a',
        '#n578f': 'b',
      },
      ExpressionAttributeValues: {
        ':v18d5': 5,
        ':ve820': 10,
        ':v862c': 2,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it('keeps existing Names/Values', () => {
    expect.assertions(1);
    const params: DynoexprInput = {
      KeyCondition: { a: 5 },
      Condition: { a: '> 10' },
      Filter: { a: 2 },
      Projection: ['a', 'b'],
      UpdateSet: { a: 2 },
      ExpressionAttributeNames: {
        '#foo': 'foo',
      },
      ExpressionAttributeValues: {
        ':foo': 'bar',
      },
    };
    const result = getSingleTableExpressions(params);
    const expected = {
      KeyConditionExpression: '(#n2661 = :v18d5)',
      ConditionExpression: '(#n2661 > :ve820)',
      FilterExpression: '(#n2661 = :v862c)',
      ProjectionExpression: '#n2661,#n578f',
      UpdateExpression: 'SET #n2661 = :v862c',
      ExpressionAttributeNames: {
        '#n2661': 'a',
        '#n578f': 'b',
        '#foo': 'foo',
      },
      ExpressionAttributeValues: {
        ':v18d5': 5,
        ':ve820': 10,
        ':v862c': 2,
        ':foo': 'bar',
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it('converts Sets to DynamoDbSet if present in ExpressionsAttributeValues', () => {
    expect.assertions(1);
    const values = {
      a: 1,
      b: 'foo',
      c: [1, 2, 3],
      d: { foo: 'bar' },
      e: new Set([1, 2]),
      f: new Set(['foo', 'bar']),
    };
    const result = convertValuesToDynamoDbSet(values);
    const expected = {
      a: 1,
      b: 'foo',
      c: [1, 2, 3],
      d: { foo: 'bar' },
      e: docClient.createSet([1, 2]),
      f: docClient.createSet(['foo', 'bar']),
    };
    expect(result).toStrictEqual(expected);
  });
});
