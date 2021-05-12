import AWS from 'aws-sdk';

import type { DynoexprOutput } from './dynoexpr';
import dynoexpr from '.';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertType<T, U extends T>(): void {
  expect.anything();
}

describe('high level API', () => {
  it("doesn't require a type to be provided", () => {
    expect.assertions(1);
    const params = dynoexpr({
      TableName: 'Table',
      Key: 1,
      UpdateSet: { color: 'pink' },
    });

    assertType<DynoexprOutput, typeof params>();
    expect(params.TableName).toBe('Table');
  });

  it('accepts a type to be applied to the output', () => {
    expect.assertions(1);
    const params = dynoexpr<AWS.DynamoDB.DocumentClient.UpdateItemInput>({
      TableName: 'Table',
      Key: 123,
      UpdateSet: { color: 'pink' },
    });

    assertType<AWS.DynamoDB.DocumentClient.ScanInput, typeof params>();
    expect(params.Key).toBe(123);
  });
});
