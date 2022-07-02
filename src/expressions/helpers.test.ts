import {
	convertValue,
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
	parseNotCondition,
	parseSizeValue,
} from './helpers';

describe('helpers for condition helpers', () => {
	it.each([
		['foo', 'foo'],
		['true', true],
		['false', false],
		['truest', 'truest'],
		['falsest', 'falsest'],
		['null', null],
		['123', 123],
		['2.5', 2.5],
		['123a', '123a'],
	])('converts from string to primitive values: %s', (value, expected) => {
		const actual = convertValue(value);
		expect(actual).toBe(expected);
	});

	describe('parse expression values', () => {
		it.each(['> 5', '>5', '>  5', '>=5', '>= 5', '>=  5'])(
			'comparison v: %s',
			(expr) => {
				const result = parseComparisonValue(expr);

				const expected = 5;
				expect(result).toBe(expected);
			}
		);

		it.each([
			'attribute_type(foo)',
			'attribute_type (foo)',
			'attribute_type  (foo)',
			'attribute_type( foo )',
		])('attribute_type(v): %s', (expr) => {
			const result = parseAttributeTypeValue(expr);

			const expected = 'foo';
			expect(result).toBe(expected);
		});

		it.each([
			'begins_with(foo)',
			'begins_with  (foo)',
			'begins_with ( foo )',
			'BEGINS_WITH (foo)',
			'begins_with foo',
			'begins_with  foo',
		])('begins_with(v): %s', (expr) => {
			const result = parseBeginsWithValue(expr);

			const expected = 'foo';
			expect(result).toBe(expected);
		});

		it.each(['between 1 and 2', 'between  1  and   2'])(
			'between v1 and v2',
			(expr) => {
				const result = parseBetweenValue(expr);

				const expected = [1, 2];
				expect(result).toStrictEqual(expected);
			}
		);

		it.each([
			'contains(foo)',
			'contains (foo)',
			'contains  (foo)',
			'contains( foo )',
			'CONTAINS(foo)',
		])('contains(v): %s', (expr) => {
			const result = parseContainsValue(expr);

			const expected = 'foo';
			expect(result).toBe(expected);
		});

		it.each([
			['in(foo)', ['foo']],
			['in (foo)', ['foo']],
			['in  (foo)', ['foo']],
			['in( foo )', ['foo']],
			['in(foo,bar,baz)', ['foo', 'bar', 'baz']],
			['in(foo, bar, baz)', ['foo', 'bar', 'baz']],
			['in(foo,  bar,  baz)', ['foo', 'bar', 'baz']],
		])('in(v1,v2,v3): %s', (expr, expected) => {
			const result = parseInValue(expr);
			expect(result).toStrictEqual(expected);
		});

		it.each([
			'size > 10',
			'size>10',
			'size >10',
			'size> 10',
			'SIZE>10',
			'size  >  10',
		])('size [op] v: %s', (expr) => {
			const result = parseSizeValue(expr);

			const expected = 10;
			expect(result).toBe(expected);
		});

		it.each([
			['not contains(foo)', 'contains(foo)'],
			['not begins_with(foo)', 'begins_with(foo)'],
			['not begins_with(1)', 'begins_with(1)'],
		])('parse not conditions: %s', (expr, expected) => {
			const result = parseNotCondition(expr);
			expect(result).toBe(expected);
		});
	});

	describe('not expressions', () => {
		const Condition = {
			a: 'not contains(foo)',
			b: 'not begins_with(foo)',
			c: 'not in(foo)',
		};

		it('builds not conditions (expression)', () => {
			const result = buildConditionExpression({ Condition });

			const expected = [
				'not contains(#n2661,:va4d8)',
				'not begins_with(#n578f,:va4d8)',
				'not #n5f33 in (:va4d8)',
			]
				.map((exp) => `(${exp})`)
				.join(' AND ');
			expect(result).toStrictEqual(expected);
		});

		it('builds not conditions (values)', () => {
			const result = buildConditionAttributeValues(Condition);

			const expected = { ':va4d8': 'foo' };
			expect(result).toStrictEqual(expected);
		});
	});

	describe('comparison operators', () => {
		const Condition = {
			a: 'foo',
			b: '> 1',
			c: '>= 2',
			d: '< 3',
			e: '<= 4',
			f: '<> 5',
			g: 'BETWEEN 6 AND 7',
			h: 'IN (foo, bar)',
		};

		it('builds a condition expression', () => {
			const result = buildConditionExpression({ Condition });

			const expected = [
				'#n2661 = :va4d8',
				'#n578f > :v849b',
				'#n5f33 >= :v862c',
				'#n91ad < :vbaf3',
				'#nec32 <= :v122c',
				'#ncce7 <> :v18d5',
				'#n845d between :vb2dc and :v2543',
				'#n5e91 in (:va4d8,:v51f2)',
			]
				.map((exp) => `(${exp})`)
				.join(' AND ');
			expect(result).toStrictEqual(expected);
		});

		it('builds a condition expression with a specific logical operator', () => {
			const result = buildConditionExpression({
				Condition,
				LogicalOperator: 'OR',
			});

			const expected = [
				'#n2661 = :va4d8',
				'#n578f > :v849b',
				'#n5f33 >= :v862c',
				'#n91ad < :vbaf3',
				'#nec32 <= :v122c',
				'#ncce7 <> :v18d5',
				'#n845d between :vb2dc and :v2543',
				'#n5e91 in (:va4d8,:v51f2)',
			]
				.map((exp) => `(${exp})`)
				.join(' OR ');
			expect(result).toStrictEqual(expected);
		});

		it('builds a condition expression with a list of expressions for the same field', () => {
			const result = buildConditionExpression({
				Condition: {
					a: [
						'foo',
						'> 1',
						'>= 2',
						'< 3',
						'<= 4',
						'<> 5',
						'BETWEEN 6 AND 7',
						'IN (foo, bar)',
					],
					b: 'bar',
				},
				LogicalOperator: 'OR',
			});

			const expected = [
				'#n2661 = :va4d8',
				'#n2661 > :v849b',
				'#n2661 >= :v862c',
				'#n2661 < :vbaf3',
				'#n2661 <= :v122c',
				'#n2661 <> :v18d5',
				'#n2661 between :vb2dc and :v2543',
				'#n2661 in (:va4d8,:v51f2)',
				'#n578f = :v51f2',
			]
				.map((exp) => `(${exp})`)
				.join(' OR ');
			expect(result).toStrictEqual(expected);
		});

		it('builds the ExpressionAttributeNameMap', () => {
			const result = buildConditionAttributeNames(Condition);

			const expected = {
				'#n2661': 'a',
				'#n578f': 'b',
				'#n5f33': 'c',
				'#n91ad': 'd',
				'#nec32': 'e',
				'#ncce7': 'f',
				'#n845d': 'g',
				'#n5e91': 'h',
			};
			expect(result).toStrictEqual(expected);
		});

		it('builds the ExpressionAttributeNameMap with an existing map', () => {
			const Condition2 = { b: 'foo' };
			const params: ConditionAttributeNamesParams = {
				ExpressionAttributeNames: { '#a': 'a' },
			};
			const result = buildConditionAttributeNames(Condition2, params);

			const expected = {
				'#a': 'a',
				'#n578f': 'b',
			};
			expect(result).toStrictEqual(expected);
		});

		it('builds the ExpressionAttributesValueMap', () => {
			const result = buildConditionAttributeValues(Condition);

			const expected = {
				':va4d8': 'foo',
				':v849b': 1,
				':v862c': 2,
				':vbaf3': 3,
				':v122c': 4,
				':v18d5': 5,
				':vb2dc': 6,
				':v2543': 7,
				':v51f2': 'bar',
			};
			expect(result).toStrictEqual(expected);
		});

		it('builds the ExpressionAttributesValueMap with an existing map', () => {
			const Condition2 = { b: 'foo' };
			const params: ConditionAttributeValuesParams = {
				ExpressionAttributeValues: { ':a': 'bar' },
			};
			const result = buildConditionAttributeValues(Condition2, params);

			const expected = {
				':a': 'bar',
				':va4d8': 'foo',
			};
			expect(result).toStrictEqual(expected);
		});

		it('builds the ExpressionAttributesValueMap with multiple expressions for the same field', () => {
			const Condition2 = { b: ['foo', 'attribute_exists'] };
			const result = buildConditionAttributeValues(Condition2);

			const expected = { ':va4d8': 'foo' };
			expect(result).toStrictEqual(expected);
		});
	});

	describe('functions', () => {
		const Condition = {
			a: 'attribute_exists',
			b: 'attribute_not_exists',
			c: 'attribute_type(S)',
			d: 'begins_with(foo)',
			e: 'contains(foo)',
			f: 'size > 10',
			g: 'attribute_exists ',
			h: ' attribute_not_exists ',
		};

		it('builds a condition expression', () => {
			const result = buildConditionExpression({ Condition });

			const expected = [
				'attribute_exists(#n2661)',
				'attribute_not_exists(#n578f)',
				'attribute_type(#n5f33,:v546e)',
				'begins_with(#n91ad,:va4d8)',
				'contains(#nec32,:va4d8)',
				'size(#ncce7) > :ve820',
				'attribute_exists(#n845d)',
				'attribute_not_exists(#n5e91)',
			]
				.map((exp) => `(${exp})`)
				.join(' AND ');
			expect(result).toStrictEqual(expected);
		});

		it('builds the ExpressionAttributeNameMap', () => {
			const result = buildConditionAttributeNames(Condition);

			const expected = {
				'#n2661': 'a',
				'#n578f': 'b',
				'#n5e91': 'h',
				'#n5f33': 'c',
				'#n845d': 'g',
				'#n91ad': 'd',
				'#nec32': 'e',
				'#ncce7': 'f',
			};
			expect(result).toStrictEqual(expected);
		});

		it('builds the ExpressionAttributesValueMap', () => {
			const result = buildConditionAttributeValues(Condition);

			const expected = {
				':v546e': 'S',
				':va4d8': 'foo',
				':ve820': 10,
			};
			expect(result).toStrictEqual(expected);
		});
	});

	it('handles comparators look-a-likes', () => {
		const Condition = {
			a: 'attribute_type_number',
			b: 'begins_without',
			c: 'inspector',
			d: 'sizeable',
			e: 'contains sugar',
			f: 'attribute_exists_there',
			g: 'attribute_not_exists_here',
		};
		const result = {
			Expression: buildConditionExpression({ Condition }),
			ExpressionAttributeNames: buildConditionAttributeNames(Condition),
			ExpressionAttributeValues: buildConditionAttributeValues(Condition),
		};

		const expected = {
			Expression: [
				'#n2661 = :vad1e',
				'#n578f = :vd2e5',
				'#n5f33 = :v0428',
				'#n91ad = :v322b',
				'#nec32 = :v9c1a',
				'#ncce7 = :vd5d5',
				'#n845d = :v4118',
			]
				.map((exp) => `(${exp})`)
				.join(' AND '),
			ExpressionAttributeNames: {
				'#n2661': 'a',
				'#n578f': 'b',
				'#n5f33': 'c',
				'#n91ad': 'd',
				'#n845d': 'g',
				'#ncce7': 'f',
				'#nec32': 'e',
			},
			ExpressionAttributeValues: {
				':v0428': 'inspector',
				':v322b': 'sizeable',
				':v4118': 'attribute_not_exists_here',
				':v9c1a': 'contains sugar',
				':vad1e': 'attribute_type_number',
				':vd2e5': 'begins_without',
				':vd5d5': 'attribute_exists_there',
			},
		};
		expect(result).toStrictEqual(expected);
	});
});
