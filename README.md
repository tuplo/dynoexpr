# dynoexpr

<p>
  <img src="https://packagephobia.now.sh/badge?p=@tuplo/dynoexpr">
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
  KeyCondition: { HashKey: 'key' },
  Filter: { color: 'blue' },
  Projection: ['weight', 'size'],
});

/*
{
  KeyConditionExpression: '(#n3141 = :v531d)',
  ExpressionAttributeValues: { ':v531d': 'key', ':v0c8f': 'blue' },
  FilterExpression: '(#n9bfd = :v0c8f)',
  ProjectionExpression: '#ndb8f,#n1a24',
  ExpressionAttributeNames: {
    '#n3141': 'HashKey',
    '#n9bfd': 'color',
    '#ndb8f': 'weight',
    '#n1a24': 'size'
  }
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

**Only changes known expression parameters**

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
