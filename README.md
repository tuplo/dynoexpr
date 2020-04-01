# dynoexpr

<p>
  <a href="https://github.com/tuplo/dynoexpr/actions">
    <img src="https://github.com/tuplo/dynoexpr/workflows/Build/badge.svg" alt="Build">
  </a>
  <a href="https://npmjs.org/package/@tuplo/dynoexpr">
    <img src="https://img.shields.io/npm/v/@tuplo/dynoexpr.svg" alt="NPM Version">
  </a>
  <img src="https://david-dm.org/tuplo/dynoexpr.svg">
  <a href="http://commitizen.github.io/cz-cli/">
      <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly">
  </a>
  <a href="https://github.com/semantic-release/semantic-release">
    <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="semantic-release">
  </a>
</p>

Expression builder for `AWS.DynamoDB.DocumentClient`.

## Install

```bash
$ npm install @tuplo/dynoexpr

# or with yarn
$ yarn add @tuplo/dynoexpr
```

## Usage

Provide one or more of the known expression builders and `dynoexpr` will replace all attribute names with safe _expression attribute names_ and values with _expression attribute values_ placeholders and construct the correct expression to use on `AWS.DynamoDB.DocumentClient` requests.

### Condition expressions

If the _condition expression_ evaluates to `true`, the operation succeeds; otherwise, the operation fails. [docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html)

```ts
// only deletes item if color is yellow

const params = dynoexpr({
  Condition: {
    color: 'yellow',
  },
});

/*
{
  ConditionExpression: '(#n9bfd = :va351)',
  ExpressionAttributeNames: {
    '#n9bfd': 'color'
  },
  ExpressionAttributeValues: {
    ':va351': 'yellow'
  }
}
*/

await docClient
  .delete({ TableName: 'Table', Key: { HashKey: 'key' }, ...params })
  .promise();
```

### KeyCondition expressions

To specify the search criteria, you use a `key condition expression` — a string that determines the items to be read from the table or index. [docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.KeyConditionExpressions)

```ts
// searches for items between 2015 and 2019

const params = dynoexpr({
  KeyCondition: {
    HashKey: 'key',
    RangeKey: 'between 2015 and 2019',
  },
});

/*
{
  KeyConditionExpression: '(#n3141 = :v531d) AND (#ne93d between :v5dbb and :v58f4)',
  ExpressionAttributeNames: {
    '#n3141': 'HashKey',
    '#ne93d': 'RangeKey'
  },
  ExpressionAttributeValues: {
    ':v531d': 'key',
    ':v5dbb': 2015,
    ':v58f4': 2019
  }}
*/

await docClient.query({ TableName: 'Table', ...params }).promise();
```

### Filter expressions

A _filter expression_ determines which items within the `Query` or `Scan` results should be returned to you. [docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.FilterExpression)

```ts
// only return items from year 2015 or with color yellow

const params = dynoexpr({
  Filter: {
    year: 2015,
    color: 'yellow',
  },
  FilterLogicalOperator: 'OR',
});

/*
{
  FilterExpression: '(#n17d8 = :v5dbb) OR (#n9bfd = :va351)',
  ExpressionAttributeNames: {
    '#n17d8': 'year',
    '#n9bfd': 'color'
  },
  ExpressionAttributeValues: {
    ':v5dbb': 2015,
    ':va351': 'yellow'
  }
}
*/

await docClient.scan({ TableName: 'Table', ...params }).promise();
```

### Projection expressions

A _projection expression_ is a string that identifies the attributes that you want. [docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ProjectionExpressions.html)

```ts
// only returns attributes `color` and `year` for item

const params = dynoexpr({
  Projection: ['year', 'color'],
});

/*
{
  ProjectionExpression: '#n17d8,#n9bfd',
  ExpressionAttributeNames: {
    '#n17d8': 'year',
    '#n9bfd': 'color'
  }
}
*/

await docClient
  .get({ TableName: 'Table', Key: { HashKey: 'key' }, ...params })
  .promise();
```

### Update expressions

An _update expression_ specifies how `UpdateItem` will modify the attributes of an item. [docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html)

**Update the value of an attribute**

```ts
// set color to `blue` on existing item

const params = dynoexpr({
  Update: { color: 'blue' },
});

/*
{
  UpdateExpression: 'SET #n9bfd = :v0c8f',
  ExpressionAttributeNames: { '#n9bfd': 'color' },
  ExpressionAttributeValues: { ':v0c8f': 'blue' }
}
*/

await docClient
  .update({ TableName: 'Table', Key: { HashKey: 'key' }, ...params })
  .promise();
```

**Performs mathematical operations on an attribute**

```ts
const params = dynoexpr({
  Update: { quantity: `quantity - 5` },
  UpdateAction: 'SET',
});

/*
{
  UpdateExpression: 'SET #nb8c1 = #nb8c1 - :v18d5',
  ExpressionAttributeNames: { '#nb8c1': 'quantity' },
  ExpressionAttributeValues: { ':v18d5': 5 }
}
*/
```

**Deletes an attribute from an item**

```ts
const params = dynoexpr({
  Update: { color: true },
  UpdateAction: 'REMOVE',
});

/*
{
  UpdateExpression: 'REMOVE #n9bfd',
  ExpressionAttributeNames: { '#n9bfd': 'color' }
}
*/
```

**Adds to a numeric attribute on an item**

```ts
const params = dynoexpr({
  Update: { quantity: 10 },
  UpdateAction: 'ADD',
});

/*
{
  UpdateExpression: 'ADD #nb8c1 :ve820',
  ExpressionAttributeNames: { '#nb8c1': 'quantity' },
  ExpressionAttributeValues: { ':ve820': 10 }
}
*/

// the `quantity` attribute would become `quantity` + 10
```

**Adds to a `Set<unknown>` attribute on an item**

```ts
const params = dynoexpr({
  Update: { color: new Set(['blue', 'yellow']) },
  UpdateAction: 'ADD',
});

/*
{
  UpdateExpression: 'ADD #n9bfd :ve93b',
  ExpressionAttributeNames: { '#n9bfd': 'color' },
  ExpressionAttributeValues: { ':ve93b': Set(2) { 'blue', 'yellow' } }
}
*/

// the color would become Set(3) { 'black', 'blue', 'yellow' }
```

**Removes from a `Set<unknown>` attribute on an item**

```ts
const params = dynoexpr({
  Update: { color: new Set(['blue', 'yellow']) },
  UpdateAction: 'DELETE',
});

/*
{
  UpdateExpression: 'DELETE #n9bfd :ve93b',
  ExpressionAttributeNames: { '#n9bfd': 'color' },
  ExpressionAttributeValues: { ':ve93b': Set(2) { 'blue', 'yellow' } }
}
*/

// the color would become Set(1) { 'black' }
```

### General use

**Using multiple expressions on the same request**

```ts
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

```ts
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

```ts
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

## API

### dynoexpr&lt;T&gt;(params)

#### `params`

Expression builders parameters

```ts
type DynamoDbPrimitive = string | number | boolean | object;
type DynamoDbValue =
  | DynamoDbPrimitive
  | DynamoDbPrimitive[]
  | Set<DynamoDbPrimitive>;

{
  Condition?: { [key: string]: DynamoDbValue },
  ConditionLogicalOperator?: 'AND' | 'OR',

  KeyCondition?: { [key: string]: DynamoDbValue },
  KeyConditionLogicalOperator?: 'AND' | 'OR',

  FilterCondition?: { [key: string]: DynamoDbValue },
  FilterLogicalOperator?: 'AND' | 'OR',

  Projection?: string[],

  Update?: { [key: string]: DynamoDbValue },
  UpdateAction?: 'SET' | 'ADD' | 'DELETE' | 'REMOVE';
}
```

#### Return value

Parameters accepted by `AWS.DynamoDB.DocumentClient`

```ts
{
  ConditionExpression?: string,

  KeyConditionExpression?: string,

  FilterConditionExpression?: string,

  ProjectionExpression?: string,

  UpdateExpression?: string,

  ExpressionAttributeNames: { [key: string]: string },
  ExpressionAtributeValues: { [key: string]: string },
}
```

## Contribute

Contributions are always welcome!

## License

MIT
