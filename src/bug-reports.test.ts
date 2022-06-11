import dynoexpr from './index';
import type { FilterInput } from './dynoexpr.d';

describe('bug reports', () => {
  it('logical operator', () => {
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1646249594000);
    const args = {
      Update: {
        modified: new Date(Date.now()).toJSON(),
        GSI1_PK: 'OPEN',
        GSI2_PK: 'REQUEST#STATUS#open#DATE#2022-03-01T13:58:09.242z',
      },
      Condition: {
        status: ['IN_PROGRESS', 'OPEN'],
      },
      ConditionLogicalOperator: 'OR',
    };
    const result = dynoexpr(args);

    const expected = {
      ConditionExpression: '(#n6258 = :vccc9) OR (#n6258 = :vf5c3)',
      ExpressionAttributeNames: {
        '#n2461': 'GSI1_PK',
        '#n6258': 'status',
        '#n98d5': 'modified',
        '#necf8': 'GSI2_PK',
      },
      ExpressionAttributeValues: {
        ':v4872': '2022-03-02T19:33:14.000Z',
        ':v6e2b': 'REQUEST#STATUS#open#DATE#2022-03-01T13:58:09.242z',
        ':vccc9': 'IN_PROGRESS',
        ':vf5c3': 'OPEN',
      },
      UpdateExpression: 'SET #n98d5 = :v4872, #n2461 = :vf5c3, #necf8 = :v6e2b',
    };
    expect(result).toStrictEqual(expected);

    dateNowSpy.mockRestore();
  });

  it('supports if_not_exists on update expressions', () => {
    const result = dynoexpr({
      Update: { number: 'if_not_exists(420)' },
    });

    const expected = {
      UpdateExpression: 'SET #n15df = if_not_exists(#n15df, :v2772)',
      ExpressionAttributeNames: { '#n15df': 'number' },
      ExpressionAttributeValues: { ':v2772': '420' },
    };
    expect(result).toStrictEqual(expected);
  });

  it('allows boolean values', () => {
    const Filter = {
      a: '<> true',
      b: '<> false',
    };
    const params: FilterInput = { Filter };
    const actual = dynoexpr(params);

    const expected = {
      ExpressionAttributeNames: { '#n2661': 'a', '#n578f': 'b' },
      ExpressionAttributeValues: { ':v2327': false, ':vcb09': true },
      FilterExpression: '(#n2661 <> :vcb09) AND (#n578f <> :v2327)',
    };
    expect(actual).toStrictEqual(expected);
  });

  it('empty ExpressionAttributeValues on UpdateRemove with Condition', () => {
    const params = {
      UpdateRemove: { 'parent.item': 1 },
      Condition: { 'parent.item': 'attribute_exists' },
    };
    const actual = dynoexpr(params);

    const expected = {
      ConditionExpression: '(attribute_exists(#nb602.#n7ebc))',
      ExpressionAttributeNames: {
        '#n7ebc': 'item',
        '#nb602': 'parent',
      },
      UpdateExpression: 'REMOVE #nb602.#n7ebc',
    };
    expect(actual).toStrictEqual(expected);
  });

  it('pass undefined to UpdateRemove', () => {
    const params = {
      UpdateRemove: { 'parent.item': undefined },
      Condition: { 'parent.item': 'attribute_exists' },
    };
    const actual = dynoexpr(params);

    const expected = {
      ConditionExpression: '(attribute_exists(#nb602.#n7ebc))',
      ExpressionAttributeNames: {
        '#n7ebc': 'item',
        '#nb602': 'parent',
      },
      UpdateExpression: 'REMOVE #nb602.#n7ebc',
    };
    expect(actual).toStrictEqual(expected);
  });

  it('handles list_append', () => {
    const params = {
      Update: { numbersArray: 'list_append([1, 2], numbersArray)' },
    };
    const actual = dynoexpr(params);

    const expected = {
      UpdateExpression: 'SET #neb9c = list_append(:v4136, #neb9c)',
      ExpressionAttributeNames: { '#neb9c': 'numbersArray' },
      ExpressionAttributeValues: { ':v4136': '[1, 2]' },
    };
    expect(actual).toStrictEqual(expected);
  });
});
