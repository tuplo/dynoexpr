/* eslint-disable @typescript-eslint/indent */
declare module 'dynoexpr' {
  export type LogicalOperatorType = 'AND' | 'OR';

  export type DynamoDbPrimitive =
    | string
    | number
    | boolean
    | Record<string, unknown>;
  export type DynamoDbValue =
    | DynamoDbPrimitive
    | DynamoDbPrimitive[]
    | Set<DynamoDbPrimitive>;

  // batch operations
  export type BatchGetInput = ProjectionInput & Record<string, unknown>;
  export type BatchWriteInput = {
    DeleteRequest?: unknown;
    PutRequest?: unknown;
  };
  export type BatchRequestItemsInput = Record<
    string,
    BatchGetInput | BatchWriteInput[]
  >;
  export type BatchRequestInput = {
    RequestItems: BatchRequestItemsInput;
    [key: string]: unknown;
  };
  export type BatchRequestOutput = {
    RequestItems: ProjectionOutput & Record<string, unknown>;
    [key: string]: unknown;
  };

  // transact operations
  export type TransactOperation =
    | 'Get'
    | 'ConditionCheck'
    | 'Put'
    | 'Delete'
    | 'Update';
  export type TransactRequestItems = Partial<
    Record<TransactOperation, DynoexprInput>
  >;
  export type TransactRequestInput = {
    TransactItems: TransactRequestItems[];
    [key: string]: unknown;
  };
  export type TransactRequestOutput = {
    TransactItems: TransactRequestItems[];
    [key: string]: unknown;
  };

  // Condition
  export type Condition = Record<string, DynamoDbValue>;
  export type ConditionInput = Partial<{
    Condition?: Condition;
    ConditionLogicalOperator: LogicalOperatorType;
    ExpressionAttributeNames: { [key: string]: string };
    ExpressionAttributeValues: { [key: string]: DynamoDbValue };
  }>;
  export type ConditionOutput = Partial<{
    ConditionExpression: string;
    ExpressionAttributeNames: { [key: string]: string };
    ExpressionAttributeValues: { [key: string]: DynamoDbValue };
  }>;

  // KeyCondition
  export type KeyCondition = Record<string, DynamoDbValue>;
  export type KeyConditionInput = Partial<{
    KeyCondition: KeyCondition;
    KeyConditionLogicalOperator: LogicalOperatorType;
    ExpressionAttributeNames: Record<string, string>;
    ExpressionAttributeValues: { [key: string]: DynamoDbValue };
  }>;
  export type KeyConditionOutput = Partial<{
    KeyConditionExpression: string;
    ExpressionAttributeNames: Record<string, string>;
    ExpressionAttributeValues: { [key: string]: DynamoDbValue };
  }>;

  // Filter
  export type Filter = Record<string, DynamoDbValue>;
  export type FilterInput = Partial<{
    Filter: Filter;
    FilterLogicalOperator: LogicalOperatorType;
    ExpressionAttributeNames: { [key: string]: string };
    ExpressionAttributeValues: { [key: string]: DynamoDbValue };
  }>;
  export type FilterOutput = Partial<{
    FilterExpression: string;
    ExpressionAttributeNames: { [key: string]: string };
    ExpressionAttributeValues: { [key: string]: DynamoDbValue };
  }>;

  // Projection
  export type Projection = string[];
  export type ProjectionInput = Partial<{
    Projection: Projection;
    ExpressionAttributeNames: Record<string, string>;
  }>;
  export type ProjectionOutput = Partial<{
    ProjectionExpression: string;
    ExpressionAttributeNames: Record<string, string>;
  }>;

  // Update
  export type Update = Record<string, DynamoDbValue>;
  export type UpdateAction = 'SET' | 'ADD' | 'DELETE' | 'REMOVE';
  export type UpdateInput = Partial<{
    Update?: Update;
    UpdateAction?: UpdateAction;
    UpdateRemove?: Update;
    UpdateAdd?: Update;
    UpdateSet?: Update;
    UpdateDelete?: Update;
    ExpressionAttributeNames: { [key: string]: string };
    ExpressionAttributeValues: { [key: string]: DynamoDbValue };
  }>;
  export type UpdateOutput = Partial<{
    UpdateExpression: string;
    ExpressionAttributeNames: { [key: string]: string };
    ExpressionAttributeValues: { [key: string]: DynamoDbValue };
  }>;

  export type DynoexprInput = ConditionInput &
    FilterInput &
    KeyConditionInput &
    ProjectionInput &
    UpdateInput &
    Record<string, unknown>;

  export type DynoexprOutput = ConditionOutput &
    FilterOutput &
    KeyConditionOutput &
    ProjectionOutput &
    UpdateOutput &
    Record<string, unknown>;
}
