/* eslint-disable @typescript-eslint/indent */
type ILogicalOperatorType = string | "AND" | "OR";

type IDynoexprInputValue =
	| string
	| string[]
	| number
	| number[]
	| boolean
	| boolean[]
	| Record<string, unknown>
	| Record<string, unknown>[]
	| Set<number>
	| Set<string>
	| null
	| undefined;

type IDynamoDbValue =
	| string
	| string[]
	| number
	| number[]
	| boolean
	| boolean[]
	| Record<string, unknown>
	| Record<string, unknown>[]
	| null
	| unknown;

// batch operations
type IBatchGetInput = IProjectionInput & Record<string, unknown>;
interface IBatchWriteInput {
	DeleteRequest?: unknown;
	PutRequest?: unknown;
}
interface IBatchRequestItemsInput {
	[key: string]: IBatchGetInput | IBatchWriteInput[];
}
export interface IBatchRequestInput {
	RequestItems: IBatchRequestItemsInput;
	[key: string]: unknown;
}
interface IBatchRequestOutput {
	RequestItems: IProjectionOutput & Record<string, unknown>;
	[key: string]: unknown;
}

// transact operations
type ITransactOperation =
	| "Get"
	| "ConditionCheck"
	| "Put"
	| "Delete"
	| "Update";

type ITransactRequestItems = Partial<
	Record<ITransactOperation, IDynoexprInput>
>;
export interface ITransactRequestInput {
	TransactItems: ITransactRequestItems[];
	[key: string]: unknown;
}
interface ITransactRequestOutput {
	TransactItems: ITransactRequestItems[];
	[key: string]: unknown;
}

// Condition
type ICondition = Record<string, IDynoexprInputValue>;
type IConditionInput = Partial<{
	Condition: ICondition;
	ConditionLogicalOperator: ILogicalOperatorType;
	ExpressionAttributeNames: { [key: string]: string };
	ExpressionAttributeValues: { [key: string]: IDynamoDbValue };
}>;
type IConditionOutput = Partial<{
	ConditionExpression: string;
	ExpressionAttributeNames: { [key: string]: string };
	ExpressionAttributeValues: { [key: string]: IDynamoDbValue };
}>;

// KeyCondition
type IKeyCondition = Record<string, IDynoexprInputValue>;
type IKeyConditionInput = Partial<{
	KeyCondition: IKeyCondition;
	KeyConditionLogicalOperator: ILogicalOperatorType;
	ExpressionAttributeNames: Record<string, string>;
	ExpressionAttributeValues: { [key: string]: IDynamoDbValue };
}>;
type IKeyConditionOutput = Partial<{
	KeyConditionExpression: string;
	ExpressionAttributeNames: Record<string, string>;
	ExpressionAttributeValues: { [key: string]: IDynamoDbValue };
}>;

// Filter
type IFilter = Record<string, IDynoexprInputValue>;
type IFilterInput = Partial<{
	Filter: IFilter;
	FilterLogicalOperator: ILogicalOperatorType;
	ExpressionAttributeNames: { [key: string]: string };
	ExpressionAttributeValues: { [key: string]: IDynamoDbValue };
}>;
type IFilterOutput = Partial<{
	FilterExpression: string;
	ExpressionAttributeNames: { [key: string]: string };
	ExpressionAttributeValues: { [key: string]: IDynamoDbValue };
}>;

// Projection
type IProjection = string[];
type IProjectionInput = Partial<{
	Projection: IProjection;
	ExpressionAttributeNames: Record<string, string>;
}>;
interface IProjectionOutput {
	ProjectionExpression?: string;
	ExpressionAttributeNames?: Record<string, string>;
}

// Update
interface IUpdate {
	[key: string]: IDynoexprInputValue;
}
type IUpdateAction = "SET" | "ADD" | "DELETE" | "REMOVE";
type IUpdateInput = Partial<{
	Update: IUpdate;
	UpdateAction: IUpdateAction;
	UpdateRemove: IUpdate;
	UpdateAdd: IUpdate;
	UpdateSet: IUpdate;
	UpdateDelete: IUpdate;
	ExpressionAttributeNames: { [key: string]: string };
	ExpressionAttributeValues: { [key: string]: IDynamoDbValue };
}>;
type IUpdateOutput = Partial<{
	UpdateExpression: string;
	ExpressionAttributeNames: { [key: string]: string };
	ExpressionAttributeValues: { [key: string]: IDynamoDbValue };
}>;

export type IDynoexprInput = IConditionInput &
	IFilterInput &
	IKeyConditionInput &
	IProjectionInput &
	IUpdateInput & {
		[key: string]: unknown;
	};

export type IDynoexprOutput = IConditionOutput &
	IFilterOutput &
	IKeyConditionOutput &
	IProjectionOutput &
	IUpdateOutput & {
		[key: string]: unknown;
	};
