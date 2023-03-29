<br />
<div align="center">
  <img src="logo.png" alt="Logo" width="120" height="120">

  <h1 align="center">dynoexpr</h3>

  <p align="center">
    Expression builder for <i>AWS.DynamoDB.DocumentClient</i>
  </p>
  <p align="center">
  	<img src="https://img.shields.io/npm/v/@tuplo/dynoexpr">
  	<a href="https://codeclimate.com/github/tuplo/dynoexpr/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/3564497cf991d094e2eb/test_coverage" />
  	</a>
  </p>

</div>

## Introduction

Converts a plain object to a DynamoDB expression with all variables and names
replaced with safe placeholders. It supports `Condition`, `KeyCondition`, `Filter`, `Projection` and `Update` expressions. The resulting expressions can then be used with `AWS.DynamoDB.DocumentClient` requests.

```typescript
import dynoexpr from '@tuplo/dynoexpr';

const params = dynoexpr({
  KeyCondition: { id: '567' },
  Condition: { rating: '> 4.5' },
  Filter: { color: 'blue' },
  Projection: ['weight', 'size'],
});

/*
{
  KeyConditionExpression: '(#nca40fdf5 = :v8dcca6b2)',
  ExpressionAttributeValues: {
    ':v8dcca6b2': '567',
    ':vc95fafc8': 4.5,
    ':v792aabee': 'blue'
  },
  ConditionExpression: '(#n0f1c2905 > :vc95fafc8)',
  FilterExpression: '(#n2d334799 = :v792aabee)',
  ProjectionExpression: '#neb86488e,#n0367c420',
  ExpressionAttributeNames: {
    '#nca40fdf5': 'id',
    '#n0f1c2905': 'rating',
    '#n2d334799': 'color',
    '#neb86488e': 'weight',
    '#n0367c420': 'size'
  }
}
*/
```

## Install

```bash
$ npm install @tuplo/dynoexpr

# or with yarn
$ yarn add @tuplo/dynoexpr
```

## Usage

### Passing parameters to DocumentClient

```typescript
const docClient = new AWS.DynamoDB.DocumentClient();

const params = dynoexpr({
  KeyCondition: {
    HashKey: 'key',
    RangeKey: 'between 2015 and 2019',
  },
});

const results = await docClient
  .query({ TableName: 'table', ...params })
  .promise();
```

### Using multiple expressions on the same field

You can use multiple expressions on the same field, by packing them into an array and assigning it to the key with the field's name.

```typescript
const params = dynoexpr({
  Condition: {
    color: ['attribute_not_exists', 'yellow', 'blue'],
  },
  ConditionLogicalOperator: 'OR',
});

/*
{
  ConditionExpression: '(attribute_not_exists(#n2d334799)) OR (#n2d334799 = :v0d81c8cd) OR (#n2d334799 = :v792aabee)',
  ExpressionAttributeNames: {
    '#n2d334799': 'color'
  },
  ExpressionAttributeValues: {
    ':v0d81c8cd': 'yellow',
    ':v792aabee': 'blue'
  }
}
*/
```

### Using functions

`DynamoDB` supports a number of [functions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions) to be evaluated when parsing expressions. You don't need to reference the `path` argument because that's identified by the object's key.

```typescript
const params = dynoexpr({
  Condition: {
    docs: 'attribute_exists',
    brand: 'attribute_not_exists',
    extra: 'attribute_type(NULL)',
    color: 'begins_with dark',
    address: 'contains(Seattle)',
    description: 'size < 20',
  },
});

/*
{
  ConditionExpression: '(attribute_exists(#nd0a55266)) AND (attribute_not_exists(#n4e5f8507)) AND (attribute_type(#n4a177797,:v64b0a475)) AND (begins_with(#n2d334799,:v1fdc3f67)) AND (contains(#n3af77f77,:v26425a2a)) AND (size(#nb6c8f268) < :vde9019e3)',
  ExpressionAttributeNames: {
    '#nd0a55266': 'docs',
    '#n4e5f8507': 'brand',
    '#n4a177797': 'extra',
    '#n2d334799': 'color',
    '#n3af77f77': 'address',
    '#nb6c8f268': 'description'
  },
  ExpressionAttributeValues: {
    ':v64b0a475': 'NULL',
    ':v1fdc3f67': 'dark',
    ':v26425a2a': 'Seattle',
    ':vde9019e3': 20
  }
}
*/
```

### Using multiple expressions on the same request

```typescript
const params = dynoexpr({
  Update: { Sum: 'Sum + 20' },
  Condition: { Sum: `< 100` },
});

/*
{
  ConditionExpression: '(#n5af617ef < :va88c83b0)',
  ExpressionAttributeNames: {
    '#n5af617ef': 'Sum'
  },
  ExpressionAttributeValues: {
    ':va88c83b0': 100,
    ':vde9019e3': 20
  },
  UpdateExpression: 'SET #n5af617ef = #n5af617ef + :vde9019e3'
}
*/
```

### Working with Sets

If a value is provided as a Set, it will be converted to `DocumentClient.DynamoDbSet`. But `dynoexpr` doesn't include `DocumentClient` so you need to provide it.

```typescript
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const params = dynoexpr({
  DocumentClient,
  Update: {
    Color: new Set(['Orange', 'Purple'])
  },
})

/*
{
  UpdateExpression: 'SET #n8979552b = :v3add0a80',
  ExpressionAttributeNames: {
    '#n8979552b': 'Color'
  },
  ExpressionAttributeValues: {
    ':v3add0a80': Set { wrapperName: 'Set', values: [Array], type: 'String' }
  }
}
*/
```

#### When using UpdateAdd or UpdateDelete, arrays are converted to DynamoDbSet

```typescript
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const params = dynoexpr({
  DocumentClient,
  UpdateAdd: {
    Color: ['Orange', 'Purple']
  }
})

/*
{
  UpdateExpression: 'ADD #ndc9f7295 :v3add0a80',
  ExpressionAttributeNames: { 
    '#ndc9f7295': 'Color'
  },
  ExpressionAttributeValues: {
    ':v3add0a80': Set { wrapperName: 'Set', values: [Array], type: 'String' }
  }
}
*/
```

### Keep existing Expressions, AttributeNames and AttributeValues

```typescript
const params = dynoexpr({
  Filter: { color: 'blue' },
  ProjectionExpression: '#year',
  ExpressionAttributeNames: {
    '#year': 'year',
  },
});

/*
{
  ProjectionExpression: '#year',
  ExpressionAttributeNames: {
    '#year': 'year',
    '#n2d334799': 'color'
  },
  FilterExpression: '(#n2d334799 = :v792aabee)',
  ExpressionAttributeValues: {
    ':v792aabee': 'blue'
  }
}
*/
```

### Using object paths on expressions

You can provide a path to an attribute on a deep object, each node will be escaped.

```typescript
const params = dynoexpr({
  Update: {
    'foo.bar.baz': 'foo.bar.baz + 1'
  }
});

/*
{
  ExpressionAttributeNames: {
    "#n22f4f0ae": "bar",
    "#n5f0025bb": "foo",
    "#n82504b33": "baz",
  },
  ExpressionAttributeValues: {
    ":vc823bd86": 1,
  },
  UpdateExpression:
    "SET #n5f0025bb.#n22f4f0ae.#n82504b33 = #n5f0025bb.#n22f4f0ae.#n82504b33 + :vc823bd86",
}
*/

```

If one of the nodes needs to escape some of its characters, use double quotes around it, like this:

```typescript
const params = dynoexpr({
  Update: {
    'foo."bar-cuz".baz': 'foo."bar-cuz".baz + 1'
  }
});
```


### Parsing atomic requests, only expressions will be replaced

You can pass the whole request parameters to `dynoexpr` - only the expression builders will be replaced.

```typescript
const params = dynoexpr({
  TableName: 'Table',
  Key: { HashKey: 'key' },
  ReturnConsumedCapacity: 'TOTAL',
  KeyCondition: {
    color: 'begins_with dark',
  },
});

/*
{
  TableName: 'Table',
  Key: { HashKey: 'key' },
  ReturnConsumedCapacity: 'TOTAL',
  KeyConditionExpression: '(begins_with(#n2d334799,:v1fdc3f67))',
  ExpressionAttributeNames: {
    '#n2d334799': 'color'
  },
  ExpressionAttributeValues: {
    ':v1fdc3f67': 'dark'
  }
}
*/
```

### Parsing Batch requests

```typescript
const params = dynoexpr({
  RequestItems: {
    'Table-1': {
      Keys: [{ foo: 'bar' }],
      Projection: ['a', 'b'],
    },
  },
  ReturnConsumedCapacity: 'TOTAL',
});

/*
{
  "RequestItems":{
    "Table-1":{
      "Keys": [{"foo":"bar"}],
      "ProjectionExpression": "#na0f0d7ff,#ne4645342",
      "ExpressionAttributeNames":{
        "#na0f0d7ff": "a",
        "#ne4645342": "b"
      }
    }
  },
  "ReturnConsumedCapacity": "TOTAL"
}
*/
```

### Parsing Transact requests

```typescript
const params = dynoexpr({
  TransactItems: [{
    Get: {
      TableName: 'Table-1',
      Key: { id: 'foo' },
      Projection: ['a', 'b'],
    },
  }],
  ReturnConsumedCapacity: 'INDEXES',
});

/*
{
  "TransactItems": [
    { 
      "Get": {
        "TableName": "Table-1",
        "Key": { "id": "foo" },
        "ProjectionExpression": "#na0f0d7ff,#ne4645342",
        "ExpressionAttributeNames": {
          "#na0f0d7ff":"a",
          "#ne4645342":"b"
        }
      }
    }
  ],
  "ReturnConsumedCapacity": "INDEXES"
}
*/
```

### Type the resulting parameters

The resulting object is compatible with all `DocumentClient` requests, but if you want to be type-safe, `dynoexpr` accepts a generic type to be applied to the return value.

```typescript
const params = dynoexpr<AWS.DocumentClient.UpdateItemInput>({
  TableName: 'Table',
  Key: 1,
  UpdateSet: { color: 'pink' },
});
```

## API

### dynoexpr&lt;T&gt;(params)

#### `params`

Expression builder parameters

```typescript
type DynamoDbPrimitive = string | number | boolean | object;
type DynamoDbValue =
  | DynamoDbPrimitive
  | DynamoDbPrimitive[]
  | Set<DynamoDbPrimitive>;

// all attributes are optional, depending on what expression(s) are to be built
{
  Condition: { [key: string]: DynamoDbValue },
  ConditionLogicalOperator: 'AND' | 'OR',

  KeyCondition: { [key: string]: DynamoDbValue },
  KeyConditionLogicalOperator: 'AND' | 'OR',

  FilterCondition: { [key: string]: DynamoDbValue },
  FilterLogicalOperator: 'AND' | 'OR',

  Projection: string[],

  Update: { [key: string]: DynamoDbValue },
  UpdateAction: 'SET' | 'ADD' | 'DELETE' | 'REMOVE',

  UpdateSet: { [key: string]: DynamoDbValue },
  UpdateAdd: { [key: string]: DynamoDbValue },
  UpdateDelete: { [key: string]: DynamoDbValue },
  UpdateRemove: { [key: string]: DynamoDbValue },
  
  DocumentClient: AWS.DynamoDB.DocumentClient
}
```

#### Return value

Parameters accepted by `AWS.DynamoDB.DocumentClient`

```typescript
// all attributes are optional depending on the expression(s) being built
{
  ConditionExpression: string,

  KeyConditionExpression: string,

  FilterConditionExpression: string,

  ProjectionExpression: string,

  UpdateExpression: string,

  ExpressionAttributeNames: { [key: string]: string },
  ExpressionAttributeValues: { [key: string]: string },
}
```

## License

MIT
