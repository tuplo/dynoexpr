import { DynoexprInput, DynoexprOutput } from 'dynoexpr';
import { getSingleTableExpressions } from './single';

describe('single table operations', () => {
  it('applies consecutive expression getters to a parameters object', () => {
    expect.assertions(1);
    const params: DynoexprInput = {
      KeyCondition: { c: 5 },
      Condition: { b: '> 10' },
      Filter: { a: 'foo' },
      Projection: ['a', 'b'],
    };
    const result = getSingleTableExpressions(params);
    const expected: DynoexprOutput = {
      KeyConditionExpression: '(#n5f33 = :v18d5)',
      ConditionExpression: '(#n578f > :ve820)',
      FilterExpression: '(#n2661 = :va4d8)',
      ProjectionExpression: '#n2661,#n578f',
      ExpressionAttributeNames: {
        '#n2661': 'a',
        '#n578f': 'b',
        '#n5f33': 'c',
      },
      ExpressionAttributeValues: {
        ':va4d8': 'foo',
        ':ve820': 10,
        ':v18d5': 5,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it("doesn't clash values for different expressions", () => {
    expect.assertions(1);
    const params: DynoexprInput = {
      KeyCondition: { a: 5 },
      Condition: { a: '> 10' },
      Filter: { a: 2 },
      Projection: ['a', 'b'],
    };
    const result = getSingleTableExpressions(params);
    const expected: DynoexprOutput = {
      KeyConditionExpression: '(#n2661 = :v18d5)',
      ConditionExpression: '(#n2661 > :ve820)',
      FilterExpression: '(#n2661 = :v862c)',
      ProjectionExpression: '#n2661,#n578f',
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
});
