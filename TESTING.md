# Testing Guide

This project uses [Vitest](https://vitest.dev/) for unit and integration testing, along with [React Testing Library](https://testing-library.com/react) for component tests.

## Running Tests

```bash
# Run tests in watch mode (default)
npm test

# Run tests once and exit
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite includes comprehensive tests for:

### ✅ Utility Functions
- **[src/lib/time.test.ts](src/lib/time.test.ts)**: Time formatting and manipulation functions
  - `formatTime()` - Convert seconds to MM:SS format
  - `roundTime()` - Round time values to specified decimals
  - `formatTimeAgo()` - Human-readable relative time formatting

- **[src/lib/marker.test.ts](src/lib/marker.test.ts)**: Audio marker utilities
  - `isSection()` - Determine if a marker is a section or point marker

### ✅ Type Definitions
- **[src/types/Audio.test.ts](src/types/Audio.test.ts)**: AudioMarker interface validation
  - Point markers (without endTimestamp)
  - Section markers (with endTimestamp)
  - Color handling
  - Edge cases and special characters

### ✅ React Hooks
- **[src/lib/hooks/useIncrementListenCount.test.ts](src/lib/hooks/useIncrementListenCount.test.ts)**: Listen count tracking
  - First-time listen increment
  - 2-hour cooldown period
  - localStorage integration
  - Audio vs. playlist handling
  - Edge cases and error scenarios

### ✅ API Validation
- **[src/server/api/routers/marker.validation.test.ts](src/server/api/routers/marker.validation.test.ts)**: tRPC input validation
  - `getMarkers` endpoint validation
  - `createMarker` endpoint validation (10+ test cases)
  - `deleteMarker` endpoint validation
  - Edge cases and invalid inputs

## Test Statistics

- **Total Test Files**: 5
- **Total Tests**: 64
- **Test Coverage**: Core utilities, types, hooks, and API validation

## Best Practices

### 1. Test Organization
Each test file follows the same structure:
```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = /* test data */;
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### 2. Test Coverage Goals
- **Utility functions**: 100% coverage with edge cases
- **Type validation**: Comprehensive input validation testing
- **React hooks**: Mock external dependencies, test state changes
- **API routes**: Input validation and authorization logic

### 3. Mocking
- localStorage is mocked globally in `vitest.setup.ts`
- Use `vi.fn()` for function mocks
- Use `vi.useFakeTimers()` for time-dependent tests
- Clean up mocks with `beforeEach()` and `afterEach()`

### 4. Writing New Tests
When adding new tests:

1. Create test file next to the source file: `feature.ts` → `feature.test.ts`
2. Import necessary testing utilities:
   ```typescript
   import { describe, it, expect, vi, beforeEach } from 'vitest';
   ```
3. Group related tests with `describe()` blocks
4. Write clear, descriptive test names using "should ..."
5. Test both success and failure cases
6. Include edge cases and boundary conditions
7. Keep tests independent and isolated

### 5. Common Patterns

**Testing async functions:**
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});
```

**Testing React hooks:**
```typescript
import { renderHook } from '@testing-library/react';

it('should update state', () => {
  const { result } = renderHook(() => useCustomHook());
  expect(result.current).toBe(expected);
});
```

**Testing with mocks:**
```typescript
import { vi } from 'vitest';

it('should call callback', () => {
  const mockFn = vi.fn();
  functionUnderTest(mockFn);
  expect(mockFn).toHaveBeenCalledWith(expected);
});
```

## Configuration

### vitest.config.ts
- Uses jsdom environment for DOM testing
- Configured path aliases (`~` → `./src`)
- Coverage reporting enabled
- Global test utilities available

### vitest.setup.ts
- Imports Testing Library matchers
- Configures automatic cleanup after each test
- Mocks localStorage globally

## Continuous Integration

Tests should be run:
- Before committing code
- In CI/CD pipeline
- Before deploying to production

Add to your CI config:
```yaml
- name: Run tests
  run: npm run test:run
```

## Troubleshooting

### Tests fail with module resolution errors
Check that path aliases in `vitest.config.ts` match `tsconfig.json`.

### localStorage errors
Ensure `vitest.setup.ts` is properly mocking localStorage.

### Timeout errors
Increase timeout for slow tests:
```typescript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

## Contributing

When contributing:
1. Write tests for all new features
2. Maintain or improve code coverage
3. Ensure all tests pass before submitting PR
4. Follow existing test patterns and conventions

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
