import { getProjectionExpression, ProjectionInput } from './projection';

describe(`projection expression`, () => {
  it(`converts a ProjectionExpression to ExpressionAttributesMap`, () => {
    expect.assertions(1);
    const params: ProjectionInput = {
      Projection: [`foo`, `cast`, `year`, `baz`],
    };
    const result = getProjectionExpression(params);
    const expected = {
      ProjectionExpression: `#na4d8,#nc464,#n17d8,#n6e88`,
      ExpressionAttributeNames: {
        '#na4d8': `foo`,
        '#nc464': `cast`,
        '#n17d8': `year`,
        '#n6e88': `baz`,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it(`adds new names to an existing ExpressionAttributesMap`, () => {
    expect.assertions(1);
    const params: ProjectionInput = {
      Projection: [`foo`, `cast`, `year`, `baz`],
      ExpressionAttributeNames: {
        '#quz': `quz`,
      },
    };
    const result = getProjectionExpression(params);
    const expected = {
      ProjectionExpression: `#na4d8,#nc464,#n17d8,#n6e88`,
      ExpressionAttributeNames: {
        '#quz': `quz`,
        '#na4d8': `foo`,
        '#nc464': `cast`,
        '#n17d8': `year`,
        '#n6e88': `baz`,
      },
    };
    expect(result).toStrictEqual(expected);
  });

  it(`maintains existing ProjectionExpression names`, () => {
    expect.assertions(1);
    const params: ProjectionInput = {
      Projection: [`foo`, `baz`],
      ExpressionAttributeNames: {
        '#foo': `foo`,
      },
    };
    const result = getProjectionExpression(params);
    const expected = {
      ProjectionExpression: `#na4d8,#n6e88`,
      ExpressionAttributeNames: {
        '#foo': `foo`,
        '#na4d8': `foo`,
        '#n6e88': `baz`,
      },
    };
    expect(result).toStrictEqual(expected);
  });
});
