import type { FilterInput } from '../dynoexpr';
import { getFilterExpression } from './filter';

describe('filter expression', () => {
  it('builds the FilterExpression and NameValueMaps - comparison operators', () => {
    expect.assertions(1);
    const Filter = {
      a: 'foo',
      b: '> 1',
      c: '>= 2',
      d: '< 3',
      e: '<= 4',
      f: '<> 5',
      g: '> six',
      h: '>= seven',
      i: '< eight',
      j: '<= nine',
      k: '<> ten',
      l: 'BETWEEN 6 AND 7',
      m: 'IN (foo, bar)',
    };
    const params: FilterInput = { Filter };
    const result = getFilterExpression(params);
    const expected = {
      FilterExpression: [
        '#n2661 = :va4d8',
        '#n578f > :v849b',
        '#n5f33 >= :v862c',
        '#n91ad < :vbaf3',
        '#nec32 <= :v122c',
        '#ncce7 <> :v18d5',
        '#n845d > :v60bf',
        '#n5e91 >= :vd432',
        '#n8741 < :vaa5c',
        '#n5515 <= :v9a54',
        '#n9df3 <> :v7eb4',
        '#n3b33 between :vb2dc and :v2543',
        '#n501b in (:va4d8,:v51f2)',
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
        '#n845d': 'g',
        '#n5e91': 'h',
        '#n8741': 'i',
        '#n5515': 'j',
        '#n9df3': 'k',
        '#n3b33': 'l',
        '#n501b': 'm',
      },
      ExpressionAttributeValues: {
        ':v849b': 1,
        ':v862c': 2,
        ':vbaf3': 3,
        ':v122c': 4,
        ':v18d5': 5,
        ':vb2dc': 6,
        ':v2543': 7,
        ':v60bf': 'six',
        ':vd432': 'seven',
        ':vaa5c': 'eight',
        ':v9a54': 'nine',
        ':v7eb4': 'ten',
        ':va4d8': 'foo',
        ':v51f2': 'bar',
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it('builds the FilterExpression and NameValueMaps - function', () => {
    expect.assertions(1);
    const Filter = {
      a: 'attribute_exists',
      b: 'attribute_not_exists',
      c: 'attribute_type(S)',
      d: 'begins_with(foo)',
      e: 'contains(foo)',
      f: 'size > 10',
    };
    const params: FilterInput = { Filter };
    const result = getFilterExpression(params);
    const expected = {
      FilterExpression: [
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

  it('builds the FilterExpression and NameValueMaps - mixed operators', () => {
    expect.assertions(1);
    const Filter = {
      a: 1,
      b: 'between 2 and 3',
      c: 'size > 4',
    };
    const params: FilterInput = { Filter };
    const result = getFilterExpression(params);
    const expected = {
      FilterExpression: [
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
