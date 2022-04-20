import dynoexpr from './index';

describe('bug reports', () => {
  it('logical operator', () => {
    expect.assertions(1);
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
    expect.assertions(1);
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
});
