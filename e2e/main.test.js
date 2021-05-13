import dynoexpr from '@tuplo/dynoexpr';

it('is testable with Jest and JavaScript', async () => {
  const result = dynoexpr({
    KeyCondition: { id: '567' },
    Condition: { rating: '> 4.5' },
    Filter: { color: 'blue' },
    Projection: ['weight', 'size'],
  });

  const expected = {
    KeyConditionExpression: '(#n0c8f = :vaa3d)',
    ConditionExpression: '(#n843d > :vf170)',
    FilterExpression: '(#n9bfd = :v0c8f)',
    ProjectionExpression: '#ndb8f,#n1a24',
    ExpressionAttributeNames: {
      '#n0c8f': 'id',
      '#n843d': 'rating',
      '#n9bfd': 'color',
      '#ndb8f': 'weight',
      '#n1a24': 'size',
    },
    ExpressionAttributeValues: {
      ':vaa3d': '567',
      ':vf170': '4.5',
      ':v0c8f': 'blue',
    },
  };
  expect(result).toStrictEqual(expected);
});
