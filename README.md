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

```ts
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

const results = await docClient
  .query({ TableName: 'Table', ...params })
  .promise();
```

###

### Condition Expressions

If the [_condition expression_](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html) evaluates to `true`, the operation succeeds; otherwise, the operation fails.

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

### KeyCondition Expressions

To specify the search criteria, you use a [_key condition expression_](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.KeyConditionExpressions) — a string that determines the items to be read from the table or index.

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

### Filter Expressions

A [_filter expression_](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.FilterExpression) determines which items within the `Query` or `Scan` results should be returned to you.

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

### Projection Expressions

A [_projection expression_](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ProjectionExpressions.html) is a string that identifies the attributes that you want.

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

### Update Expressions

An [_update expression_](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html) specifies how `UpdateItem` will modify the attributes of an item.

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

**Adds to a numeric attribute**

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

### General Use

**Using functions**

`DynamoDB` supports a number of [functions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions) to be evaluated when parsing expressions. You don't need to reference the `path` argument because that's identified by the object's key.

```ts
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

You can pass the whole request parameters to `dynoexpr` - only the expression builders will be replaced.

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

**Type the resulting parameters**

The resulting object is type-compatible with all `DocumentClient` requests, but if you want to be specific, `dynoexpr` accepts a generic type to be applied to the return value.

```ts
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

```ts
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

```ts
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
