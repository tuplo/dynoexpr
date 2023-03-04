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

interface IExpressionAttributeNames {
	[key: string]: string;
}
interface IExpressionAttributeValues {
	[key: string]: IDynamoDbValue;
}

interface IExpressionAttributes {
	ExpressionAttributeNames?: IExpressionAttributeNames;
	ExpressionAttributeValues?: IExpressionAttributeValues;
}

// batch operations
interface IBatchGetInput extends IProjectionInput {
	[key: string]: unknown;
}
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
interface ICondition {
	[key: string]: IDynoexprInputValue;
}
interface IConditionInput extends IExpressionAttributes {
	Condition?: ICondition;
	ConditionLogicalOperator?: ILogicalOperatorType;
	[key: string]: unknown;
}
interface IConditionOutput extends IExpressionAttributes {
	ConditionExpression?: string;
	[key: string]: unknown;
}

// KeyCondition
interface IKeyCondition {
	[key: string]: IDynoexprInputValue;
}
interface IKeyConditionInput extends IExpressionAttributes {
	KeyCondition?: IKeyCondition;
	KeyConditionLogicalOperator?: ILogicalOperatorType;
	[key: string]: unknown;
}
interface IKeyConditionOutput extends IExpressionAttributes {
	KeyConditionExpression?: string;
}

// Filter
interface IFilter {
	[key: string]: IDynoexprInputValue;
}
interface IFilterInput extends IExpressionAttributes {
	Filter?: IFilter;
	FilterLogicalOperator?: ILogicalOperatorType;
	[key: string]: unknown;
}
interface IFilterOutput extends IExpressionAttributes {
	FilterExpression?: string;
}

// Projection
type IProjection = string[];
interface IProjectionInput {
	Projection?: IProjection;
	ExpressionAttributeNames?: IExpressionAttributeNames;
	[key: string]: unknown;
}
interface IProjectionOutput extends IExpressionAttributes {
	ProjectionExpression?: string;
	ExpressionAttributeNames?: IExpressionAttributeNames;
}

// Update
interface IUpdate {
	[key: string]: IDynoexprInputValue;
}
type IUpdateAction = "SET" | "ADD" | "DELETE" | "REMOVE";
interface IUpdateInput extends IExpressionAttributes {
	Update?: IUpdate;
	UpdateAction?: IUpdateAction;
	UpdateRemove?: IUpdate;
	UpdateAdd?: IUpdate;
	UpdateSet?: IUpdate;
	UpdateDelete?: IUpdate;
	[key: string]: unknown;
}
interface IUpdateOutput extends IExpressionAttributes {
	UpdateExpression?: string;
	[key: string]: unknown;
}

export interface IDynoexprInput
	extends IConditionInput,
		IFilterInput,
		IKeyConditionInput,
		IProjectionInput,
		IUpdateInput {
	[key: string]: unknown;
}

export interface IDynoexprOutput
	extends IConditionOutput,
		IFilterOutput,
		IKeyConditionOutput,
		IProjectionOutput,
		IUpdateOutput {
	[key: string]: unknown;
}
