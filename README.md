# dynoexpr

<p>
  <img src="https://img.shields.io/npm/v/@tuplo/dynoexpr">
  <img src="https://github.com/tuplo/dynoexpr/workflows/Build/badge.svg">
  <img src="https://david-dm.org/tuplo/dynoexpr.svg">
</p>

Expression builder for `AWS.DynamoDB.DocumentClient`.

## Install

```bash
$ npm install @tuplo/dynoexpr

# or with yarn
$ yarn add @tuplo/dynoexpr
```

## Usage

Converts a plain object to a DynamoDB expression with all variables and names replaced with safe placeholders. It supports `Condition`, `KeyCondition`, `Filter`, `Projection` and `Update` expressions. The resulting expressions can then be used with `AWS.DynamoDB.DocumentClient` requests.

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
  KeyConditionExpression: '(#n0c8f = :vaa3d)',
  ConditionExpression: '(#n843d > :v122c)',
  FilterExpression: '(#n9bfd = :v0c8f)',
  ProjectionExpression: '#ndb8f,#n1a24',
  ExpressionAttributeNames: {
    '#n0c8f': 'id',
    '#n843d': 'rating',
    '#n9bfd': 'color',
    '#ndb8f': 'weight',
    '#n1a24': 'size'
  }
  ExpressionAttributeValues: {
    ':vaa3d': '567',
    ':v122c': 4,
    ':v0c8f': 'blue'
  },
}
*/
```

**Passing parameters to DocumentClient**

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

**Using functions**

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
  ConditionExpression: '(attribute_exists(#nd286)) \
    AND (attribute_not_exists(#n0ed7)) \
    AND (attribute_type(#na4d6,:vec29)) \
    AND (begins_with(#n9bfd,:vbe37)) \
    AND (contains(#n536a,:v7bff)) \
    AND (size(#n2786) < :v3b84)',
  ExpressionAttributeNames: {
    '#nd286': 'docs',
    '#n0ed7': 'brand',
    '#na4d6': 'extra',
    '#n9bfd': 'color',
    '#n536a': 'address',
    '#n2786': 'description'
  },
  ExpressionAttributeValues: {
    ':vec29': 'NULL',
    ':vbe37': 'dark',
    ':v7bff': 'Seattle',
    ':v3b84': 20
  }
}
*/
```

**Using multiple expressions on the same request**

```typescript
const params = dynoexpr({
  Update: { Sum: 'Sum + 20' },
  Condition: { Sum: `< 100` },
});

/*
{
  ConditionExpression: '(#na3d5 < :vc6dd)',
  UpdateExpression: 'SET #na3d5 = #na3d5 + :v3b84'
  ExpressionAttributeNames: {
    '#na3d5': 'Sum'
  },
  ExpressionAttributeValues: {
    ':vc6dd': 100,
    ':v3b84': 20
  },
 }
*/
```

**Keep existing Expressions, AttributeNames and AttributeValues**

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
  FilterExpression: '(#n9bfd = :v0c8f)',
  ExpressionAttributeNames: {
    '#year': 'year',
    '#n9bfd': 'color'
  },
  ExpressionAttributeValues: {
    ':v0c8f': 'blue'
  }
}
*/
```

**Parsing atomic requests, only expressions will be replaced**

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
  KeyConditionExpression: '(begins_with(#n9bfd,:vbe37))',
  ExpressionAttributeNames: {
    '#n9bfd': 'color'
  },
  ExpressionAttributeValues: {
    ':vbe37': 'dark'
  }
}
*/
```

**Parsing Batch requests**

```typescript
const params = dynoexpr({
  RequestItems: {
    'Table-1': {
      Keys: [{ foo: 'bar' }],
      Projection: [`a`, `b`],
    },
  },
  ReturnConsumedCapacity: 'TOTAL',
});

/*
{
  RequestItems: {
    'Table-1': {
      Keys: [{ foo: 'bar' }],
      ProjectionExpression: `#n2661,#n578f`,
      ExpressionAttributeNames: {
        '#n2661': `a`,
        '#n578f': `b`,
      },
    },
  },
  ReturnConsumedCapacity: 'TOTAL',
}
*/
```

**Parsing Transact requests**

```typescript
const params = dynoexpr({
  TransactItems: [
    {
      Get: {
        TableName: 'Table-1',
        Key: { id: 'foo' },
        Projection: ['a', 'b'],
      },
    },
  ],
  ReturnConsumedCapacity: 'INDEXES',
});

/*
{
  TransactItems: [
    {
      Get: {
        TableName: `Table-1`,
        Key: { id: `foo` },
        ProjectionExpression: `#n2661,#n578f`,
        ExpressionAttributeNames: {
          '#n2661': `a`,
          '#n578f': `b`,
        },
      },
    },
  ],
  ReturnConsumedCapacity: 'INDEXES',
}
*/
```

**Type the resulting parameters**

The resulting object is type-compatible with all `DocumentClient` requests, but if you want to be specific, `dynoexpr` accepts a generic type to be applied to the return value.

```typescript
const params = dynoexpr<AWS.DocumentClient.ScanInput>({
  TableName: 'Table',
  Filter: { year: 2015 },
  Projection: ['color', 'brand'],
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
  UpdateAction: 'SET' | 'ADD' | 'DELETE' | 'REMOVE';

  UpdateSet: { [key: string]: DynamoDbValue },
  UpdateAdd: { [key: string]: DynamoDbValue },
  UpdateDelete: { [key: string]: DynamoDbValue },
  UpdateRemove: { [key: string]: DynamoDbValue },
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
  ExpressionAtributeValues: { [key: string]: string },
}
```

## Contribute

Contributions are always welcome!

## License

MIT
