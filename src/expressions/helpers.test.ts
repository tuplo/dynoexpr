import {
  buildConditionAttributeNames,
  buildConditionAttributeValues,
  buildConditionExpression,
  ConditionAttributeNamesParams,
  ConditionAttributeValuesParams,
  parseAttributeTypeValue,
  parseBeginsWithValue,
  parseBetweenValue,
  parseComparisonValue,
  parseContainsValue,
  parseInValue,
  parseSizeValue,
} from './helpers';

describe(`helpers for condition helpers`, () => {
  describe(`parse expression values`, () => {
    it(`comparison v`, () => {
      expect.assertions(6);
      const exprs = [`> 5`, `>5`, `>  5`, `>=5`, `>= 5`, `>=  5`];
      const expected = 5;
      exprs.forEach((exp) => {
        const result = parseComparisonValue(exp);
        expect(result).toBe(expected);
      });
    });

    it(`attribute_type(v)`, () => {
      expect.assertions(4);
      const exprs = [
        `attribute_type(foo)`,
        `attribute_type (foo)`,
        `attribute_type  (foo)`,
        `attribute_type( foo )`,
      ];
      const expected = `foo`;
      exprs.forEach((exp) => {
        const result = parseAttributeTypeValue(exp);
        expect(result).toBe(expected);
      });
    });

    it(`begins_with(v)`, () => {
      expect.assertions(6);
      const exprs = [
        `begins_with(foo)`,
        `begins_with  (foo)`,
        `begins_with ( foo )`,
        `BEGINS_WITH (foo)`,
        `begins_with foo`,
        `begins_with  foo`,
      ];
      const expected = `foo`;
      exprs.forEach((expr) => {
        const result = parseBeginsWithValue(expr);
        expect(result).toBe(expected);
      });
    });

    it(`between v1 and v2`, () => {
      expect.assertions(2);
      const exprs = [`between 1 and 2`, `between  1  and   2`];
      const expected = [1, 2];
      exprs.forEach((exp) => {
        const result = parseBetweenValue(exp);
        expect(result).toStrictEqual(expected);
      });
    });

    it(`contains(v)`, () => {
      expect.assertions(5);
      const exprs = [
        `contains(foo)`,
        `contains (foo)`,
        `contains  (foo)`,
        `contains( foo )`,
        `CONTAINS(foo)`,
      ];
      const expected = `foo`;
      exprs.forEach((expr) => {
        const result = parseContainsValue(expr);
        expect(result).toBe(expected);
      });
    });

    it(`in(v1,v2,v3)`, () => {
      expect.assertions(7);
      const exprs = [
        `in(foo)`,
        `in (foo)`,
        `in  (foo)`,
        `in( foo )`,
        `in(foo,bar,baz)`,
        `in(foo, bar, baz)`,
        `in(foo,  bar,  baz)`,
      ];
      const expected = [
        [`foo`],
        [`foo`],
        [`foo`],
        [`foo`],
        [`foo`, `bar`, `baz`],
        [`foo`, `bar`, `baz`],
        [`foo`, `bar`, `baz`],
      ];
      exprs.forEach((expr, i) => {
        const result = parseInValue(expr);
        expect(result).toStrictEqual(expected[i]);
      });
    });

    it(`size [op] v`, () => {
      expect.assertions(6);
      const exprs = [
        `size > 10`,
        `size>10`,
        `size >10`,
        `size> 10`,
        `SIZE>10`,
        `size  >  10`,
      ];
      const expected = 10;
      exprs.forEach((expr) => {
        const result = parseSizeValue(expr);
        expect(result).toBe(expected);
      });
    });
  });

  describe(`comparison operators`, () => {
    const Condition = {
      a: `foo`,
      b: `> 1`,
      c: `>= 2`,
      d: `< 3`,
      e: `<= 4`,
      f: `<> 5`,
      g: `BETWEEN 6 AND 7`,
      h: `IN (foo, bar)`,
    };

    it(`builds a condition expression`, () => {
      expect.assertions(1);
      const result = buildConditionExpression({ Condition });
      const expected = [
        `#n2661 = :va4d8`,
        `#n578f > :v849b`,
        `#n5f33 >= :v862c`,
        `#n91ad < :vbaf3`,
        `#nec32 <= :v122c`,
        `#ncce7 <> :v18d5`,
        `#n845d between :vb2dc and :v2543`,
        `#n5e91 in (:va4d8,:v51f2)`,
      ]
        .map((exp) => `(${exp})`)
        .join(` AND `);
      expect(result).toStrictEqual(expected);
    });

    it(`builds a condition expression with a specific logical operator`, () => {
      expect.assertions(1);
      const result = buildConditionExpression({
        Condition,
        LogicalOperator: `OR`,
      });
      const expected = [
        `#n2661 = :va4d8`,
        `#n578f > :v849b`,
        `#n5f33 >= :v862c`,
        `#n91ad < :vbaf3`,
        `#nec32 <= :v122c`,
        `#ncce7 <> :v18d5`,
        `#n845d between :vb2dc and :v2543`,
        `#n5e91 in (:va4d8,:v51f2)`,
      ]
        .map((exp) => `(${exp})`)
        .join(` OR `);
      expect(result).toStrictEqual(expected);
    });

    it(`builds the ExpressionAttributeNameMap`, () => {
      expect.assertions(1);
      const result = buildConditionAttributeNames(Condition);
      const expected = {
        '#n2661': `a`,
        '#n578f': `b`,
        '#n5f33': `c`,
        '#n91ad': `d`,
        '#nec32': `e`,
        '#ncce7': `f`,
        '#n845d': `g`,
        '#n5e91': `h`,
      };
      expect(result).toStrictEqual(expected);
    });

    it(`builds the ExpressionAttributeNameMap with an existing map`, () => {
      expect.assertions(1);
      const Condition2 = { b: `foo` };
      const params: ConditionAttributeNamesParams = {
        ExpressionAttributeNames: { '#a': `a` },
      };
      const result = buildConditionAttributeNames(Condition2, params);
      const expected = {
        '#a': `a`,
        '#n578f': `b`,
      };
      expect(result).toStrictEqual(expected);
    });

    it(`builds the ExpressionAttributesValueMap`, () => {
      expect.assertions(1);
      const result = buildConditionAttributeValues(Condition);
      const expected = {
        ':va4d8': `foo`,
        ':v849b': 1,
        ':v862c': 2,
        ':vbaf3': 3,
        ':v122c': 4,
        ':v18d5': 5,
        ':vb2dc': 6,
        ':v2543': 7,
        ':v51f2': `bar`,
      };
      expect(result).toStrictEqual(expected);
    });

    it(`builds the ExpressionAttributesValueMap with an existing map`, () => {
      expect.assertions(1);
      const Condition2 = { b: `foo` };
      const params: ConditionAttributeValuesParams = {
        ExpressionAttributeValues: { ':a': `bar` },
      };
      const result = buildConditionAttributeValues(Condition2, params);
      const expected = {
        ':a': `bar`,
        ':va4d8': `foo`,
      };
      expect(result).toStrictEqual(expected);
    });
  });

  describe(`functions`, () => {
    const Condition = {
      a: `attribute_exists`,
      b: `attribute_not_exists`,
      c: `attribute_type(S)`,
      d: `begins_with(foo)`,
      e: `contains(foo)`,
      f: `size > 10`,
      g: `attribute_exists `,
      h: ` attribute_not_exists `,
    };

    it(`builds a condition expression`, () => {
      expect.assertions(1);
      const result = buildConditionExpression({ Condition });
      const expected = [
        `attribute_exists(#n2661)`,
        `attribute_not_exists(#n578f)`,
        `attribute_type(#n5f33,:v546e)`,
        `begins_with(#n91ad,:va4d8)`,
        `contains(#nec32,:va4d8)`,
        `size(#ncce7) > :ve820`,
        `attribute_exists(#n845d)`,
        `attribute_not_exists(#n5e91)`,
      ]
        .map((exp) => `(${exp})`)
        .join(` AND `);
      expect(result).toStrictEqual(expected);
    });

    it(`builds the ExpressionAttributeNameMap`, () => {
      expect.assertions(1);
      const result = buildConditionAttributeNames(Condition);
      const expected = {
        '#n2661': `a`,
        '#n578f': `b`,
        '#n5e91': 'h',
        '#n5f33': `c`,
        '#n845d': 'g',
        '#n91ad': `d`,
        '#nec32': `e`,
        '#ncce7': `f`,
      };
      expect(result).toStrictEqual(expected);
    });

    it(`builds the ExpressionAttributesValueMap`, () => {
      expect.assertions(1);
      const result = buildConditionAttributeValues(Condition);
      const expected = {
        ':v546e': `S`,
        ':va4d8': `foo`,
        ':ve820': 10,
      };
      expect(result).toStrictEqual(expected);
    });
  });

  it(`handles comparators look-alikes`, () => {
    expect.assertions(1);
    const Condition = {
      a: `attribute_type_number`,
      b: `begins_without`,
      c: `between you and me`,
      d: `< ten`,
      e: `inspector`,
      f: `sizeable`,
      g: `contains sugar`,
      i: `attribute_exists_there`,
      j: `attribute_not_exists_here`,
    };
    const result = {
      Expression: buildConditionExpression({ Condition }),
      ExpressionAttributeNames: buildConditionAttributeNames(Condition),
      ExpressionAttributeValues: buildConditionAttributeValues(Condition),
    };
    const expected = {
      Expression: [
        `#n2661 = :vad1e`,
        `#n578f = :vd2e5`,
        `#n5f33 = :v9003`,
        `#n91ad = :v97c1`,
        `#nec32 = :v0428`,
        `#ncce7 = :v322b`,
        `#n845d = :v9c1a`,
        `#n8741 = :vd5d5`,
        `#n5515 = :v4118`,
      ]
        .map((exp) => `(${exp})`)
        .join(` AND `),
      ExpressionAttributeNames: {
        '#n2661': 'a',
        '#n5515': 'j',
        '#n578f': 'b',
        '#n5f33': 'c',
        '#n845d': 'g',
        '#n8741': 'i',
        '#n91ad': 'd',
        '#ncce7': 'f',
        '#nec32': 'e',
      },
      ExpressionAttributeValues: {
        ':v0428': 'inspector',
        ':v322b': 'sizeable',
        ':v4118': 'attribute_not_exists_here',
        ':v9003': 'between you and me',
        ':v97c1': '< ten',
        ':v9c1a': 'contains sugar',
        ':vad1e': 'attribute_type_number',
        ':vd2e5': 'begins_without',
        ':vd5d5': 'attribute_exists_there',
      },
    };
    expect(result).toStrictEqual(expected);
  });
});
