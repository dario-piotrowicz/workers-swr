import { describe, expect, test } from 'vitest';

describe('should error', () => {
	test('2 is not equal 1', () => {
		expect(2).toEqual(1);
	});
});
