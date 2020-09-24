import dynoexpr from './index';

describe('get expressions', () => {
  it('accepts a generic type', () => {
    expect.assertions(1);
    const params: DynoexprInput = {
      Projection: ['a'],
    };
    type QueryInput = {
      ProjectionExpression: string;
      ExpressionAttributeNames: Record<string, string>;
    };
    const result = dynoexpr<QueryInput>(params);
    const expected = {
      ProjectionExpression: '#n2661',
      ExpressionAttributeNames: {
        '#n2661': 'a',
      },
    };
    expect(result).toStrictEqual(expected);
  });
});
