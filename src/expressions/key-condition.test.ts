import type { KeyConditionInput } from '../dynoexpr';
import { getKeyConditionExpression } from './key-condition';

describe('key condition expression', () => {
  it('builds the ConditionExpression and NameValueMaps - comparison operators', () => {
    const KeyCondition = {
      a: 'foo',
      b: '> 1',
      c: '>= 2',
      d: '< 3',
      e: '<= 4',
      f: '<> 5',
      fa: '<> true',
      g: 'BETWEEN 6 AND 7',
      h: 'IN (foo, bar)',
    };
    const params: KeyConditionInput = { KeyCondition };
    const result = getKeyConditionExpression(params);

    const expected = {
      KeyConditionExpression: [
        '#n2661 = :va4d8',
        '#n578f > :v849b',
        '#n5f33 >= :v862c',
        '#n91ad < :vbaf3',
        '#nec32 <= :v122c',
        '#ncce7 <> :v18d5',
        '#n9e65 <> :vcb09',
        '#n845d between :vb2dc and :v2543',
        '#n5e91 in (:va4d8,:v51f2)',
      ]
        .map((exp) => `(${exp})`)
        .join(' AND '),
      ExpressionAttributeNames: {
        '#n2661': 'a',
        '#n578f': 'b',
        '#n5f33': 'c',
        '#n91ad': 'd',
        '#nec32': 'e',
        '#ncce7': 'f',
        '#n9e65': 'fa',
        '#n845d': 'g',
        '#n5e91': 'h',
      },
      ExpressionAttributeValues: {
        ':v849b': 1,
        ':v862c': 2,
        ':vbaf3': 3,
        ':v122c': 4,
        ':v18d5': 5,
        ':vb2dc': 6,
        ':v2543': 7,
        ':va4d8': 'foo',
        ':v51f2': 'bar',
        ':vcb09': true,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it('builds the ConditionExpression and NameValueMaps - function', () => {
    const KeyCondition = {
      a: 'attribute_exists',
      b: 'attribute_not_exists',
      c: 'attribute_type(S)',
      d: 'begins_with(foo)',
      e: 'contains(foo)',
      f: 'size > 10',
    };
    const params: KeyConditionInput = { KeyCondition };
    const result = getKeyConditionExpression(params);

    const expected = {
      KeyConditionExpression: [
        'attribute_exists(#n2661)',
        'attribute_not_exists(#n578f)',
        'attribute_type(#n5f33,:v546e)',
        'begins_with(#n91ad,:va4d8)',
        'contains(#nec32,:va4d8)',
        'size(#ncce7) > :ve820',
      ]
        .map((exp) => `(${exp})`)
        .join(' AND '),
      ExpressionAttributeNames: {
        '#n2661': 'a',
        '#n578f': 'b',
        '#n5f33': 'c',
        '#n91ad': 'd',
        '#nec32': 'e',
        '#ncce7': 'f',
      },
      ExpressionAttributeValues: {
        ':v546e': 'S',
        ':va4d8': 'foo',
        ':ve820': 10,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it('builds the ConditionExpression and NameValueMaps - mixed operators', () => {
    const KeyCondition = {
      a: 1,
      b: 'between 2 and 3',
      c: 'size > 4',
    };
    const params: KeyConditionInput = { KeyCondition };
    const result = getKeyConditionExpression(params);

    const expected = {
      KeyConditionExpression: [
        '#n2661 = :v849b',
        '#n578f between :v862c and :vbaf3',
        'size(#n5f33) > :v122c',
      ]
        .map((exp) => `(${exp})`)
        .join(' AND '),
      ExpressionAttributeNames: {
        '#n2661': 'a',
        '#n578f': 'b',
        '#n5f33': 'c',
      },
      ExpressionAttributeValues: {
        ':v849b': 1,
        ':v862c': 2,
        ':vbaf3': 3,
        ':v122c': 4,
      },
    };
    expect(result).toStrictEqual(expected);
  });
});
