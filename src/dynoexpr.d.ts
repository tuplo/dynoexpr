/* eslint-disable @typescript-eslint/indent */
type LogicalOperatorType = 'AND' | 'OR';

type DynoexprInputValue =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | Record<string, unknown>
  | Record<string, unknown>[]
  | Set<number>
  | Set<string>;

type DynamoDbValue =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | Record<string, unknown>
  | Record<string, unknown>[]
  | unknown;

// batch operations
type BatchGetInput = ProjectionInput & Record<string, unknown>;
type BatchWriteInput = {
  DeleteRequest?: unknown;
  PutRequest?: unknown;
};
type BatchRequestItemsInput = Record<string, BatchGetInput | BatchWriteInput[]>;
type BatchRequestInput = {
  RequestItems: BatchRequestItemsInput;
  [key: string]: unknown;
};
type BatchRequestOutput = {
  RequestItems: ProjectionOutput & Record<string, unknown>;
  [key: string]: unknown;
};

// transact operations
type TransactOperation = 'Get' | 'ConditionCheck' | 'Put' | 'Delete' | 'Update';
type TransactRequestItems = Partial<Record<TransactOperation, DynoexprInput>>;
type TransactRequestInput = {
  TransactItems: TransactRequestItems[];
  [key: string]: unknown;
};
type TransactRequestOutput = {
  TransactItems: TransactRequestItems[];
  [key: string]: unknown;
};

// Condition
type Condition = Record<string, DynoexprInputValue>;
type ConditionInput = Partial<{
  Condition: Condition;
  ConditionLogicalOperator: LogicalOperatorType;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;
type ConditionOutput = Partial<{
  ConditionExpression: string;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;

// KeyCondition
type KeyCondition = Record<string, DynoexprInputValue>;
type KeyConditionInput = Partial<{
  KeyCondition: KeyCondition;
  KeyConditionLogicalOperator: LogicalOperatorType;
  ExpressionAttributeNames: Record<string, string>;
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;
type KeyConditionOutput = Partial<{
  KeyConditionExpression: string;
  ExpressionAttributeNames: Record<string, string>;
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;

// Filter
type Filter = Record<string, DynoexprInputValue>;
type FilterInput = Partial<{
  Filter: Filter;
  FilterLogicalOperator: LogicalOperatorType;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;
type FilterOutput = Partial<{
  FilterExpression: string;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;

// Projection
type Projection = string[];
type ProjectionInput = Partial<{
  Projection: Projection;
  ExpressionAttributeNames: Record<string, string>;
}>;
type ProjectionOutput = Partial<{
  ProjectionExpression: string;
  ExpressionAttributeNames: Record<string, string>;
}>;

// Update
type Update = Record<string, DynoexprInputValue>;
type UpdateAction = 'SET' | 'ADD' | 'DELETE' | 'REMOVE';
type UpdateInput = Partial<{
  Update?: Update;
  UpdateAction?: UpdateAction;
  UpdateRemove?: Update;
  UpdateAdd?: Update;
  UpdateSet?: Update;
  UpdateDelete?: Update;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;
type UpdateOutput = Partial<{
  UpdateExpression: string;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: DynamoDbValue };
}>;

type DynoexprInput = ConditionInput &
  FilterInput &
  KeyConditionInput &
  ProjectionInput &
  UpdateInput &
  Record<string, unknown>;

type DynoexprOutput = ConditionOutput &
  FilterOutput &
  KeyConditionOutput &
  ProjectionOutput &
  UpdateOutput &
  Record<string, unknown>;

export type DynoexprFn = (
  params: DynoexprInput | BatchRequestInput | TransactRequestInput
) => DynoexprOutput;
