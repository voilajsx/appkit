# Utilities Module API Reference

## Overview

The `@voilajsx/appkit/utils` module provides a comprehensive set of
framework-agnostic JavaScript utilities for manipulating objects, formatting
strings, handling dates, and managing asynchronous operations. These utilities
are designed for simplicity, performance, and compatibility with Node.js and
browser environments.

## Installation

```bash
npm install @voilajsx/appkit
```

## Quick Start

```javascript
import { pick, slugify, formatDate, retry } from '@voilajsx/appkit/utils';
```

## API Reference

### Object Utilities

#### pick(obj, keys)

Extracts specified keys from an object.

##### Parameters

| Name   | Type       | Required | Default | Description                         |
| ------ | ---------- | -------- | ------- | ----------------------------------- |
| `obj`  | `Object`   | Yes      | -       | The source object to pick keys from |
| `keys` | `string[]` | Yes      | -       | Array of keys to extract            |

##### Returns

- `Object` - A new object containing only the specified keys

##### Throws

- `Error` - With message `'First argument must be an object'` if `obj` is not an
  object

##### Example

```javascript
const obj = { name: 'John', age: 30, email: 'john@example.com' };
const result = pick(obj, ['name', 'email']);
// { name: 'John', email: 'john@example.com' }
```

---

#### omit(obj, keys)

Removes specified keys from an object.

##### Parameters

| Name   | Type       | Required | Default | Description                         |
| ------ | ---------- | -------- | ------- | ----------------------------------- |
| `obj`  | `Object`   | Yes      | -       | The source object to omit keys from |
| `keys` | `string[]` | Yes      | -       | Array of keys to remove             |

##### Returns

- `Object` - A new object without the specified keys

##### Throws

- `Error` - With message `'First argument must be an object'` if `obj` is not an
  object

##### Example

```javascript
const obj = { name: 'John', age: 30, email: 'john@example.com' };
const result = omit(obj, ['age']);
// { name: 'John', email: 'john@example.com' }
```

---

#### deepMerge(target, ...sources)

Deeply merges multiple objects into a target object.

##### Parameters

| Name      | Type       | Required | Default | Description                         |
| --------- | ---------- | -------- | ------- | ----------------------------------- |
| `target`  | `Object`   | Yes      | -       | The target object to merge into     |
| `sources` | `Object[]` | Yes      | -       | One or more source objects to merge |

##### Returns

- `Object` - The merged object

##### Example

```javascript
const target = { user: { name: 'John' } };
const source = { user: { age: 30 } };
const result = deepMerge(target, source);
// { user: { name: 'John', age: 30 } }
```

---

#### deepClone(obj)

Creates a deep copy of an object.

##### Parameters

| Name  | Type  | Required | Default | Description         |
| ----- | ----- | -------- | ------- | ------------------- |
| `obj` | `Any` | Yes      | -       | The object to clone |

##### Returns

- `Any` - A deep copy of the input object

##### Example

```javascript
const obj = { user: { name: 'John' } };
const clone = deepClone(obj);
clone.user.name = 'Jane';
console.log(obj.user.name); // 'John'
```

---

#### get(obj, path, defaultValue)

Gets a value from an object using a path.

##### Parameters

| Name           | Type     | Required  | Default     | Description                           |
| -------------- | -------- | --------- | ----------- | ------------------------------------- | --------------------- |
| `obj`          | `Object` | Yes       | -           | The source object                     |
| `path`         | `string  | string[]` | Yes         | -                                     | The path to the value |
| `defaultValue` | `Any`    | No        | `undefined` | Value to return if path doesn't exist |

##### Returns

- `Any` - The value at the path or the default value

##### Example

```javascript
const obj = { user: { name: 'John' } };
const name = get(obj, 'user.name', 'Unknown');
// 'John'
```

---

#### set(obj, path, value)

Sets a value in an object at a specified path.

##### Parameters

| Name    | Type     | Required  | Default | Description       |
| ------- | -------- | --------- | ------- | ----------------- | ------------------------- |
| `obj`   | `Object` | Yes       | -       | The target object |
| `path`  | `string  | string[]` | Yes     | -                 | The path to set the value |
| `value` | `Any`    | Yes       | -       | The value to set  |

##### Returns

- `Object` - The modified object

##### Example

```javascript
const obj = { user: {} };
set(obj, 'user.name', 'John');
// { user: { name: 'John' } }
```

---

#### has(obj, path)

Checks if a path exists in an object.

##### Parameters

| Name   | Type     | Required  | Default | Description       |
| ------ | -------- | --------- | ------- | ----------------- | ----------------- |
| `obj`  | `Object` | Yes       | -       | The source object |
| `path` | `string  | string[]` | Yes     | -                 | The path to check |

##### Returns

- `boolean` - `true` if the path exists, `false` otherwise

##### Example

```javascript
const obj = { user: { name: 'John' } };
const exists = has(obj, 'user.name');
// true
```

---

#### flatten(obj, separator)

Flattens a nested object into a single-level object.

##### Parameters

| Name        | Type     | Required | Default | Description                  |
| ----------- | -------- | -------- | ------- | ---------------------------- |
| `obj`       | `Object` | Yes      | -       | The object to flatten        |
| `separator` | `string` | No       | `'.'`   | Separator for flattened keys |

##### Returns

- `Object` - A flattened object

##### Example

```javascript
const obj = { user: { name: 'John' } };
const flat = flatten(obj);
// { 'user.name': 'John' }
```

---

#### unflatten(obj, separator)

Converts a flat object to a nested structure.

##### Parameters

| Name        | Type     | Required | Default | Description                  |
| ----------- | -------- | -------- | ------- | ---------------------------- |
| `obj`       | `Object` | Yes      | -       | The flat object to unflatten |
| `separator` | `string` | No       | `'.'`   | Separator used in flat keys  |

##### Returns

- `Object` - A nested object

##### Example

```javascript
const flat = { 'user.name': 'John' };
const nested = unflatten(flat);
// { user: { name: 'John' } }
```

---

#### isEqual(a, b)

Compares two values for deep equality.

##### Parameters

| Name | Type  | Required | Default | Description             |
| ---- | ----- | -------- | ------- | ----------------------- |
| `a`  | `Any` | Yes      | -       | First value to compare  |
| `b`  | `Any` | Yes      | -       | Second value to compare |

##### Returns

- `boolean` - `true` if values are deeply equal, `false` otherwise

##### Example

```javascript
const obj1 = { user: { name: 'John' } };
const obj2 = { user: { name: 'John' } };
const equal = isEqual(obj1, obj2);
// true
```

---

#### isEmpty(value)

Checks if a value is empty.

##### Parameters

| Name    | Type  | Required | Default | Description    |
| ------- | ----- | -------- | ------- | -------------- |
| `value` | `Any` | Yes      | -       | Value to check |

##### Returns

- `boolean` - `true` if value is empty, `false` otherwise

##### Example

```javascript
const empty = isEmpty({});
// true
```

---

#### defaults(obj, defaultValues)

Applies default values to an object.

##### Parameters

| Name            | Type     | Required | Default | Description             |
| --------------- | -------- | -------- | ------- | ----------------------- |
| `obj`           | `Object` | Yes      | -       | The target object       |
| `defaultValues` | `Object` | Yes      | -       | Default values to apply |

##### Returns

- `Object` - The object with defaults applied

##### Example

```javascript
const obj = { name: 'John' };
const result = defaults(obj, { age: 30, email: 'unknown@example.com' });
// { name: 'John', age: 30, email: 'unknown@example.com' }
```

---

#### mapKeys(obj, iteratee)

Transforms object keys using a callback.

##### Parameters

| Name       | Type       | Required | Default | Description                |
| ---------- | ---------- | -------- | ------- | -------------------------- |
| `obj`      | `Object`   | Yes      | -       | The source object          |
| `iteratee` | `Function` | Yes      | -       | Callback to transform keys |

##### Returns

- `Object` - A new object with transformed keys

##### Example

```javascript
const obj = { firstName: 'John', lastName: 'Doe' };
const result = mapKeys(obj, (key) => key.toUpperCase());
// { FIRSTNAME: 'John', LASTNAME: 'Doe' }
```

---

#### mapValues(obj, iteratee)

Transforms object values using a callback.

##### Parameters

| Name       | Type       | Required | Default | Description                  |
| ---------- | ---------- | -------- | ------- | ---------------------------- |
| `obj`      | `Object`   | Yes      | -       | The source object            |
| `iteratee` | `Function` | Yes      | -       | Callback to transform values |

##### Returns

- `Object` - A new object with transformed values

##### Example

```javascript
const obj = { age: 30, score: 85 };
const result = mapValues(obj, (value) => value + 10);
// { age: 40, score: 95 }
```

---

#### groupBy(array, key)

Groups array items by a key or callback.

##### Parameters

| Name    | Type    | Required  | Default | Description        |
| ------- | ------- | --------- | ------- | ------------------ | ------------------------------------- |
| `array` | `Any[]` | Yes       | -       | The array to group |
| `key`   | `string | Function` | Yes     | -                  | Property name or callback to group by |

##### Returns

- `Object` - An object with grouped items

##### Example

```javascript
const items = [
  { type: 'fruit', name: 'apple' },
  { type: 'fruit', name: 'banana' },
  { type: 'vegetable', name: 'carrot' },
];
const grouped = groupBy(items, 'type');
// { fruit: [{ type: 'fruit', name: 'apple' }, { type: 'fruit', name: 'banana' }], vegetable: [{ type: 'vegetable', name: 'carrot' }] }
```

---

#### keyBy(array, key)

Creates an object with array items keyed by a property or callback.

##### Parameters

| Name    | Type    | Required  | Default | Description      |
| ------- | ------- | --------- | ------- | ---------------- | ----------------------------------- |
| `array` | `Any[]` | Yes       | -       | The array to key |
| `key`   | `string | Function` | Yes     | -                | Property name or callback to key by |

##### Returns

- `Object` - An object with keyed items

##### Example

```javascript
const items = [
  { id: 1, name: 'apple' },
  { id: 2, name: 'banana' },
];
const keyed = keyBy(items, 'id');
// { '1': { id: 1, name: 'apple' }, '2': { id: 2, name: 'banana' } }
```

---

### String Utilities

#### capitalize(str)

Capitalizes the first letter of a string.

##### Parameters

| Name  | Type     | Required | Default | Description              |
| ----- | -------- | -------- | ------- | ------------------------ |
| `str` | `string` | Yes      | -       | The string to capitalize |

##### Returns

- `string` - The capitalized string

##### Example

```javascript
const result = capitalize('hello');
// 'Hello'
```

---

#### camelCase(str)

Converts a string to camelCase.

##### Parameters

| Name  | Type     | Required | Default | Description           |
| ----- | -------- | -------- | ------- | --------------------- |
| `str` | `string` | Yes      | -       | The string to convert |

##### Returns

- `string` - The camelCase string

##### Example

```javascript
const result = camelCase('hello world');
// 'helloWorld'
```

---

#### snakeCase(str)

Converts a string to snake_case.

##### Parameters

| Name  | Type     | Required | Default | Description           |
| ----- | -------- | -------- | ------- | --------------------- |
| `str` | `string` | Yes      | -       | The string to convert |

##### Returns

- `string` - The snake_case string

##### Example

```javascript
const result = snakeCase('hello world');
// 'hello_world'
```

---

#### kebabCase(str)

Converts a string to kebab-case.

##### Parameters

| Name  | Type     | Required | Default | Description           |
| ----- | -------- | -------- | ------- | --------------------- |
| `str` | `string` | Yes      | -       | The string to convert |

##### Returns

- `string` - The kebab-case string

##### Example

```javascript
const result = kebabCase('hello world');
// 'hello-world'
```

---

#### pascalCase(str)

Converts a string to PascalCase.

##### Parameters

| Name  | Type     | Required | Default | Description           |
| ----- | -------- | -------- | ------- | --------------------- |
| `str` | `string` | Yes      | -       | The string to convert |

##### Returns

- `string` - The PascalCase string

##### Example

```javascript
const result = pascalCase('hello world');
// 'HelloWorld'
```

---

#### titleCase(str)

Converts a string to Title Case.

##### Parameters

| Name  | Type     | Required | Default | Description           |
| ----- | -------- | -------- | ------- | --------------------- |
| `str` | `string` | Yes      | -       | The string to convert |

##### Returns

- `string` - The Title Case string

##### Example

```javascript
const result = titleCase('hello world');
// 'Hello World'
```

---

#### generateId(length, prefix)

Generates a random ID.

##### Parameters

| Name     | Type     | Required | Default | Description       |
| -------- | -------- | -------- | ------- | ----------------- |
| `length` | `number` | No       | `16`    | Length of the ID  |
| `prefix` | `string` | No       | `''`    | Prefix for the ID |

##### Returns

- `string` - The generated ID

##### Example

```javascript
const id = generateId(8, 'user_');
// e.g., 'user_abcdef12'
```

---

#### generateUuid()

Generates a UUID v4.

##### Parameters

None

##### Returns

- `string` - A UUID v4 string

##### Example

```javascript
const uuid = generateUuid();
// e.g., '123e4567-e89b-12d3-a456-426614174000'
```

---

#### slugify(str, options)

Creates a URL-friendly slug.

##### Parameters

| Name                | Type      | Required | Default | Description               |
| ------------------- | --------- | -------- | ------- | ------------------------- |
| `str`               | `string`  | Yes      | -       | The string to slugify     |
| `options`           | `Object`  | No       | `{}`    | Configuration options     |
| `options.separator` | `string`  | No       | `'-'`   | Separator for slug parts  |
| `options.lowercase` | `boolean` | No       | `true`  | Convert to lowercase      |
| `options.strict`    | `boolean` | No       | `false` | Remove special characters |
| `options.maxLength` | `number`  | No       | `100`   | Maximum slug length       |

##### Returns

- `string` - The slugified string

##### Example

```javascript
const slug = slugify('Hello World!', { separator: '_', maxLength: 20 });
// 'hello_world'
```

---

#### truncate(str, length, suffix)

Truncates a string to a specified length.

##### Parameters

| Name     | Type     | Required | Default | Description                 |
| -------- | -------- | -------- | ------- | --------------------------- |
| `str`    | `string` | Yes      | -       | The string to truncate      |
| `length` | `number` | Yes      | -       | Maximum length              |
| `suffix` | `string` | No       | `'...'` | Suffix for truncated string |

##### Returns

- `string` - The truncated string

##### Example

```javascript
const result = truncate('Hello World', 5);
// 'Hello...'
```

---

#### padStart(str, length, char)

Pads the start of a string with a character.

##### Parameters

| Name     | Type     | Required | Default | Description       |
| -------- | -------- | -------- | ------- | ----------------- |
| `str`    | `string` | Yes      | -       | The string to pad |
| `length` | `number` | Yes      | -       | Target length     |
| `char`   | `string` | No       | `' '`   | Padding character |

##### Returns

- `string` - The padded string

##### Example

```javascript
const result = padStart('123', 5, '0');
// '00123'
```

---

#### padEnd(str, length, char)

Pads the end of a string with a character.

##### Parameters

| Name     | Type     | Required | Default | Description       |
| -------- | -------- | -------- | ------- | ----------------- |
| `str`    | `string` | Yes      | -       | The string to pad |
| `length` | `number` | Yes      | -       | Target length     |
| `char`   | `string` | No       | `' '`   | Padding character |

##### Returns

- `string` - The padded string

##### Example

```javascript
const result = padEnd('123', 5, '0');
// '12300'
```

---

#### template(str, data)

Replaces placeholders in a string with data.

##### Parameters

| Name   | Type     | Required | Default | Description                  |
| ------ | -------- | -------- | ------- | ---------------------------- |
| `str`  | `string` | Yes      | -       | The template string          |
| `data` | `Object` | Yes      | -       | Data to replace placeholders |

##### Returns

- `string` - The rendered string

##### Example

```javascript
const result = template('Hello, {{name}}!', { name: 'John' });
// 'Hello, John!'
```

---

#### escapeHtml(str)

Escapes HTML characters in a string.

##### Parameters

| Name  | Type     | Required | Default | Description          |
| ----- | -------- | -------- | ------- | -------------------- |
| `str` | `string` | Yes      | -       | The string to escape |

##### Returns

- `string` - The escaped string

##### Example

```javascript
const result = escapeHtml('<div>Hello</div>');
// '&lt;div&gt;Hello&lt;/div&gt;'
```

---

#### unescapeHtml(str)

Unescapes HTML characters in a string.

##### Parameters

| Name  | Type     | Required | Default | Description            |
| ----- | -------- | -------- | ------- | ---------------------- |
| `str` | `string` | Yes      | -       | The string to unescape |

##### Returns

- `string` - The unescaped string

##### Example

```javascript
const result = unescapeHtml('&lt;div&gt;Hello&lt;/div&gt;');
// '<div>Hello</div>'
```

---

#### escapeRegExp(str)

Escapes special regex characters in a string.

##### Parameters

| Name  | Type     | Required | Default | Description          |
| ----- | -------- | -------- | ------- | -------------------- |
| `str` | `string` | Yes      | -       | The string to escape |

##### Returns

- `string` - The escaped string

##### Example

```javascript
const result = escapeRegExp('hello.world');
// 'hello\\.world'
```

---

#### maskString(str, options)

Masks characters in a string.

##### Parameters

| Name                    | Type     | Required | Default | Description                           |
| ----------------------- | -------- | -------- | ------- | ------------------------------------- |
| `str`                   | `string` | Yes      | -       | The string to mask                    |
| `options`               | `Object` | No       | `{}`    | Configuration options                 |
| `options.showFirst`     | `number` | No       | `0`     | Number of characters to show at start |
| `options.showLast`      | `number` | No       | `0`     | Number of characters to show at end   |
| `options.maskChar`      | `string` | No       | `'*'`   | Masking character                     |
| `options.minMaskLength` | `number` | No       | `3`     | Minimum number of masked characters   |

##### Returns

- `string` - The masked string

##### Example

```javascript
const result = maskString('1234567890', { showFirst: 2, showLast: 2 });
// '12******90'
```

---

### Date Utilities

#### formatDate(date, format)

Formats a date to a specified pattern.

##### Parameters

| Name     | Type     | Required | Default | Description                             |
| -------- | -------- | -------- | ------- | --------------------------------------- | --- | ------------------ |
| `date`   | `Date    | string   | number` | Yes                                     | -   | The date to format |
| `format` | `string` | Yes      | -       | The format pattern (e.g., 'YYYY-MM-DD') |

##### Returns

- `string` - The formatted date

##### Example

```javascript
const result = formatDate(new Date('2025-06-01'), 'MMM DD, YYYY');
// 'Jun 01, 2025'
```

---

#### parseDate(dateString, format)

Parses a date string to a Date object.

##### Parameters

| Name         | Type     | Required | Default | Description                   |
| ------------ | -------- | -------- | ------- | ----------------------------- |
| `dateString` | `string` | Yes      | -       | The date string to parse      |
| `format`     | `string` | No       | -       | The format of the date string |

##### Returns

- `Date` - The parsed Date object

##### Example

```javascript
const date = parseDate('2025-06-01', 'YYYY-MM-DD');
// Date object for June 1, 2025
```

---

#### addDays(date, days)

Adds days to a date.

##### Parameters

| Name   | Type     | Required | Default | Description           |
| ------ | -------- | -------- | ------- | --------------------- | --- | ------------------ |
| `date` | `Date    | string   | number` | Yes                   | -   | The date to modify |
| `days` | `number` | Yes      | -       | Number of days to add |

##### Returns

- `Date` - The new Date object

##### Example

```javascript
const result = addDays('2025-06-01', 7);
// Date object for June 8, 2025
```

---

#### addMonths(date, months)

Adds months to a date.

##### Parameters

| Name     | Type     | Required | Default | Description             |
| -------- | -------- | -------- | ------- | ----------------------- | --- | ------------------ |
| `date`   | `Date    | string   | number` | Yes                     | -   | The date to modify |
| `months` | `number` | Yes      | -       | Number of months to add |

##### Returns

- `Date` - The new Date object

##### Example

```javascript
const result = addMonths('2025-06-01', 1);
// Date object for July 1, 2025
```

---

#### addYears(date, years)

Adds years to a date.

##### Parameters

| Name    | Type     | Required | Default | Description            |
| ------- | -------- | -------- | ------- | ---------------------- | --- | ------------------ |
| `date`  | `Date    | string   | number` | Yes                    | -   | The date to modify |
| `years` | `number` | Yes      | -       | Number of years to add |

##### Returns

- `Date` - The new Date object

##### Example

```javascript
const result = addYears('2025-06-01', 1);
// Date object for June 1, 2026
```

---

#### subDays(date, days)

Subtracts days from a date.

##### Parameters

| Name   | Type     | Required | Default | Description                |
| ------ | -------- | -------- | ------- | -------------------------- | --- | ------------------ |
| `date` | `Date    | string   | number` | Yes                        | -   | The date to modify |
| `days` | `number` | Yes      | -       | Number of days to subtract |

##### Returns

- `Date` - The new Date object

##### Example

```javascript
const result = subDays('2025-06-01', 7);
// Date object for May 25, 2025
```

---

#### subMonths(date, months)

Subtracts months from a date.

##### Parameters

| Name     | Type     | Required | Default | Description                  |
| -------- | -------- | -------- | ------- | ---------------------------- | --- | ------------------ |
| `date`   | `Date    | string   | number` | Yes                          | -   | The date to modify |
| `months` | `number` | Yes      | -       | Number of months to subtract |

##### Returns

- `Date` - The new Date object

##### Example

```javascript
const result = subMonths('2025-06-01', 1);
// Date object for May 1, 2025
```

---

#### subYears(date, years)

Subtracts years from a date.

##### Parameters

| Name    | Type     | Required | Default | Description                 |
| ------- | -------- | -------- | ------- | --------------------------- | --- | ------------------ |
| `date`  | `Date    | string   | number` | Yes                         | -   | The date to modify |
| `years` | `number` | Yes      | -       | Number of years to subtract |

##### Returns

- `Date` - The new Date object

##### Example

```javascript
const result = subYears('2025-06-01', 1);
// Date object for June 1, 2024
```

---

#### dateDiff(date1, date2, unit)

Calculates the difference between two dates.

##### Parameters

| Name    | Type     | Required | Default  | Description                                  |
| ------- | -------- | -------- | -------- | -------------------------------------------- | --- | --------------- |
| `date1` | `Date    | string   | number`  | Yes                                          | -   | The first date  |
| `date2` | `Date    | string   | number`  | Yes                                          | -   | The second date |
| `unit`  | `string` | No       | `'days'` | Unit of difference ('seconds', 'days', etc.) |

##### Returns

- `number` - The difference in the specified unit

##### Throws

- `Error` - With message `'Invalid unit'` if unit is not supported

##### Example

```javascript
const diff = dateDiff('2025-06-01', '2025-06-08', 'days');
// 7
```

---

#### startOf(date, unit)

Gets the start of a time unit.

##### Parameters

| Name   | Type     | Required | Default | Description                        |
| ------ | -------- | -------- | ------- | ---------------------------------- | --- | ------------------- |
| `date` | `Date    | string   | number` | Yes                                | -   | The date to process |
| `unit` | `string` | Yes      | -       | Time unit ('day', 'month', 'year') |

##### Returns

- `Date` - The start of the specified unit

##### Throws

- `Error` - With message `'Invalid unit'` if unit is not supported

##### Example

```javascript
const result = startOf('2025-06-15', 'month');
// Date object for June 1, 2025
```

---

#### endOf(date, unit)

Gets the end of a time unit.

##### Parameters

| Name   | Type     | Required | Default | Description                        |
| ------ | -------- | -------- | ------- | ---------------------------------- | --- | ------------------- |
| `date` | `Date    | string   | number` | Yes                                | -   | The date to process |
| `unit` | `string` | Yes      | -       | Time unit ('day', 'month', 'year') |

##### Returns

- `Date` - The end of the specified unit

##### Throws

- `Error` - With message `'Invalid unit'` if unit is not supported

##### Example

```javascript
const result = endOf('2025-06-15', 'month');
// Date object for June 30, 2025
```

---

#### isBetween(date, start, end)

Checks if a date is between two dates.

##### Parameters

| Name    | Type  | Required | Default | Description |
| ------- | ----- | -------- | ------- | ----------- | --- | ----------------- |
| `date`  | `Date | string   | number` | Yes         | -   | The date to check |
| `start` | `Date | string   | number` | Yes         | -   | The start date    |
| `end`   | `Date | string   | number` | Yes         | -   | The end date      |

##### Returns

- `boolean` - `true` if date is between start and end, `false` otherwise

##### Example

```javascript
const result = isBetween('2025-06-05', '2025-06-01', '2025-06-10');
// true
```

---

#### isAfter(date1, date2)

Checks if one date is after another.

##### Parameters

| Name    | Type  | Required | Default | Description |
| ------- | ----- | -------- | ------- | ----------- | --- | --------------- |
| `date1` | `Date | string   | number` | Yes         | -   | The first date  |
| `date2` | `Date | string   | number` | Yes         | -   | The second date |

##### Returns

- `boolean` - `true` if date1 is after date2, `false` otherwise

##### Example

```javascript
const result = isAfter('2025-06-02', '2025-06-01');
// true
```

---

#### isBefore(date1, date2)

Checks if one date is before another.

##### Parameters

| Name    | Type  | Required | Default | Description |
| ------- | ----- | -------- | ------- | ----------- | --- | --------------- |
| `date1` | `Date | string   | number` | Yes         | -   | The first date  |
| `date2` | `Date | string   | number` | Yes         | -   | The second date |

##### Returns

- `boolean` - `true` if date1 is before date2, `false` otherwise

##### Example

```javascript
const result = isBefore('2025-06-01', '2025-06-02');
// true
```

---

### Async Utilities

#### sleep(ms)

Pauses execution for a specified time.

##### Parameters

| Name | Type     | Required | Default | Description                       |
| ---- | -------- | -------- | ------- | --------------------------------- |
| `ms` | `number` | Yes      | -       | Duration to sleep in milliseconds |

##### Returns

- `Promise<void>` - Resolves after the specified time

##### Throws

- `Error` - With message `'Delay must be a positive number'` if `ms` is not
  positive

##### Example

```javascript
await sleep(1000); // Pause for 1 second
```

---

#### retry(fn, options)

Retries a failed async operation.

##### Parameters

| Name               | Type       | Required | Default      | Description                        |
| ------------------ | ---------- | -------- | ------------ | ---------------------------------- |
| `fn`               | `Function` | Yes      | -            | The async function to retry        |
| `options`          | `Object`   | No       | `{}`         | Configuration options              |
| `options.attempts` | `number`   | No       | `3`          | Number of retry attempts           |
| `options.delay`    | `number`   | No       | `1000`       | Initial delay between retries (ms) |
| `options.maxDelay` | `number`   | No       | `10000`      | Maximum delay between retries (ms) |
| `options.factor`   | `number`   | No       | `2`          | Exponential backoff factor         |
| `options.onRetry`  | `Function` | No       | -            | Callback on retry                  |
| `options.retryIf`  | `Function` | No       | `() => true` | Condition to retry                 |

##### Returns

- `Promise<Any>` - The result of the function

##### Throws

- `Error` - With message `'First argument must be a function'` if `fn` is not a
  function
- `Error` - With message `'Attempts must be at least 1'` if `attempts` is
  invalid

##### Example

```javascript
const result = await retry(() => fetch('https://api.example.com'), {
  attempts: 3,
});
```

---

#### timeout(promise, ms, timeoutError)

Adds a timeout to a promise.

##### Parameters

| Name           | Type      | Required | Default | Description                      |
| -------------- | --------- | -------- | ------- | -------------------------------- | ------------------------- |
| `promise`      | `Promise` | Yes      | -       | The promise to timeout           |
| `ms`           | `number`  | Yes      | -       | Timeout duration in milliseconds |
| `timeoutError` | `string   | Error`   | No      | `'Operation timed out'`          | Error to throw on timeout |

##### Returns

- `Promise<Any>` - The promise result or timeout error

##### Throws

- `Error` - With message `'First argument must be a Promise'` if `promise` is
  not a Promise
- `Error` - With message `'Timeout must be a positive number'` if `ms` is not
  positive

##### Example

```javascript
const result = await timeout(fetch('https://api.example.com'), 5000);
```

---

#### parallel(tasks, concurrency)

Runs async tasks in parallel with optional concurrency limit.

##### Parameters

| Name          | Type         | Required | Default    | Description                   |
| ------------- | ------------ | -------- | ---------- | ----------------------------- |
| `tasks`       | `Function[]` | Yes      | -          | Array of async task functions |
| `concurrency` | `number`     | No       | `Infinity` | Maximum concurrent tasks      |

##### Returns

- `Promise<Any[]>` - Array of task results

##### Throws

- `Error` - With message `'Tasks must be an array'` if `tasks` is not an array
- `Error` - With message `'Concurrency must be a positive number'` if
  `concurrency` is invalid

##### Example

```javascript
const results = await parallel(
  [() => Promise.resolve(1), () => Promise.resolve(2)],
  2
);
```

---

#### series(tasks)

Runs async tasks sequentially.

##### Parameters

| Name    | Type         | Required | Default | Description                   |
| ------- | ------------ | -------- | ------- | ----------------------------- |
| `tasks` | `Function[]` | Yes      | -       | Array of async task functions |

##### Returns

- `Promise<Any[]>` - Array of task results

##### Throws

- `Error` - With message `'Tasks must be an array'` if `tasks` is not an array

##### Example

```javascript
const results = await series([
  () => Promise.resolve(1),
  () => Promise.resolve(2),
]);
```

---

#### debounce(fn, wait, options)

Creates a debounced function.

##### Parameters

| Name               | Type       | Required | Default | Description                    |
| ------------------ | ---------- | -------- | ------- | ------------------------------ |
| `fn`               | `Function` | Yes      | -       | The function to debounce       |
| `wait`             | `number`   | Yes      | -       | Debounce delay in milliseconds |
| `options`          | `Object`   | No       | `{}`    | Configuration options          |
| `options.leading`  | `boolean`  | No       | `false` | Trigger on leading edge        |
| `options.trailing` | `boolean`  | No       | `true`  | Trigger on trailing edge       |

##### Returns

- `Function` - The debounced function with a `cancel` method

##### Throws

- `Error` - With message `'First argument must be a function'` if `fn` is not a
  function
- `Error` - With message `'Wait must be a positive number'` if `wait` is invalid

##### Example

```javascript
const debounced = debounce((query) => console.log(query), 300);
debounced('test'); // Logs after 300ms of inactivity
```

---

#### throttle(fn, wait, options)

Creates a throttled function.

##### Parameters

| Name               | Type       | Required | Default | Description                       |
| ------------------ | ---------- | -------- | ------- | --------------------------------- |
| `fn`               | `Function` | Yes      | -       | The function to throttle          |
| `wait`             | `number`   | Yes      | -       | Throttle interval in milliseconds |
| `options`          | `Object`   | No       | `{}`    | Configuration options             |
| `options.leading`  | `boolean`  | No       | `true`  | Trigger on leading edge           |
| `options.trailing` | `boolean`  | No       | `true`  | Trigger on trailing edge          |

##### Returns

- `Function` - The throttled function with a `cancel` method

##### Throws

- `Error` - With message `'First argument must be a function'` if `fn` is not a
  function
- `Error` - With message `'Wait must be a positive number'` if `wait` is invalid

##### Example

```javascript
const throttled = throttle(() => console.log('click'), 1000);
throttled(); // Logs at most once per second
```

---

#### mapAsync(array, mapper, concurrency)

Maps array items to async results.

##### Parameters

| Name          | Type       | Required | Default    | Description                   |
| ------------- | ---------- | -------- | ---------- | ----------------------------- |
| `array`       | `Any[]`    | Yes      | -          | The array to map              |
| `mapper`      | `Function` | Yes      | -          | Async mapping function        |
| `concurrency` | `number`   | No       | `Infinity` | Maximum concurrent operations |

##### Returns

- `Promise<Any[]>` - Array of mapped results

##### Throws

- `Error` - With message `'First argument must be an array'` if `array` is not
  an array
- `Error` - With message `'Mapper must be a function'` if `mapper` is not a
  function

##### Example

```javascript
const results = await mapAsync([1, 2, 3], async (item) => item * 2, 2);
// [2, 4, 6]
```

---

#### filterAsync(array, predicate, concurrency)

Filters array items with an async predicate.

##### Parameters

| Name          | Type       | Required | Default    | Description                   |
| ------------- | ---------- | -------- | ---------- | ----------------------------- |
| `array`       | `Any[]`    | Yes      | -          | The array to filter           |
| `predicate`   | `Function` | Yes      | -          | Async predicate function      |
| `concurrency` | `number`   | No       | `Infinity` | Maximum concurrent operations |

##### Returns

- `Promise<Any[]>` - Array of filtered items

##### Throws

- `Error` - With message `'First argument must be an array'` if `array` is not
  an array
- `Error` - With message `'Predicate must be a function'` if `predicate` is not
  a function

##### Example

```javascript
const results = await filterAsync([1, 2, 3], async (item) => item > 1, 2);
// [2, 3]
```

---

#### allSettled(promises)

Resolves all promises with their status.

##### Parameters

| Name       | Type        | Required | Default | Description       |
| ---------- | ----------- | -------- | ------- | ----------------- |
| `promises` | `Promise[]` | Yes      | -       | Array of promises |

##### Returns

- `Promise<Object[]>` - Array of objects with `status`, `value`, or `reason`

##### Throws

- `Error` - With message `'First argument must be an array of promises'` if
  `promises` is not an array of promises

##### Example

```javascript
const results = await allSettled([
  Promise.resolve(1),
  Promise.reject(new Error('fail')),
]);
// [{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: Error }]
```

---

#### raceWithTimeout(promises, ms, timeoutError)

Races promises with a timeout.

##### Parameters

| Name           | Type        | Required | Default | Description                      |
| -------------- | ----------- | -------- | ------- | -------------------------------- | ------------------------- |
| `promises`     | `Promise[]` | Yes      | -       | Array of promises                |
| `ms`           | `number`    | Yes      | -       | Timeout duration in milliseconds |
| `timeoutError` | `string     | Error`   | No      | `'Race timed out'`               | Error to throw on timeout |

##### Returns

- `Promise<Any>` - The first resolved value or timeout error

##### Throws

- `Error` - With message `'First argument must be an array of promises'` if
  `promises` is not an array of promises

##### Example

```javascript
const result = await raceWithTimeout(
  [Promise.resolve(1), Promise.resolve(2)],
  1000
);
```

---

#### deferred()

Creates a deferred promise.

##### Parameters

None

##### Returns

- `Object` - `{ promise: Promise, resolve: Function, reject: Function }`

##### Example

```javascript
const { promise, resolve } = deferred();
resolve('done');
await promise; // 'done'
```

---

#### createQueue(concurrency)

Creates a task queue with concurrency control.

##### Parameters

| Name          | Type     | Required | Default | Description              |
| ------------- | -------- | -------- | ------- | ------------------------ |
| `concurrency` | `number` | No       | `1`     | Maximum concurrent tasks |

##### Returns

- `Object` -
  `{ push: Function, wait: Function, size: Function, clear: Function }`

##### Throws

- `Error` - With message `'Concurrency must be a positive number'` if
  `concurrency` is invalid

##### Example

```javascript
const queue = createQueue(2);
queue.push(async () => 'task1');
queue.push(async () => 'task2');
await queue.wait();
```

---

## Error Handling

All functions throw errors with descriptive messages. Use try-catch blocks for
robust error handling:

```javascript
try {
  const result = await retry(fetchData, { attempts: 3 });
} catch (error) {
  console.error('Operation failed:', error.message);
}
```

### Common Error Messages

| Function                        | Error Message                                 | Cause                  |
| ------------------------------- | --------------------------------------------- | ---------------------- |
| `pick`, `omit`                  | "First argument must be an object"            | Invalid object         |
| `dateDiff`, `startOf`, `endOf`  | "Invalid unit"                                | Unsupported time unit  |
| `sleep`                         | "Delay must be a positive number"             | Invalid delay          |
| `retry`                         | "First argument must be a function"           | Invalid function       |
| `retry`                         | "Attempts must be at least 1"                 | Invalid attempts       |
| `timeout`                       | "First argument must be a Promise"            | Invalid promise        |
| `timeout`                       | "Timeout must be a positive number"           | Invalid timeout        |
| `parallel`, `series`            | "Tasks must be an array"                      | Invalid tasks array    |
| `parallel`                      | "Concurrency must be a positive number"       | Invalid concurrency    |
| `debounce`, `throttle`          | "First argument must be a function"           | Invalid function       |
| `debounce`, `throttle`          | "Wait must be a positive number"              | Invalid wait time      |
| `mapAsync`                      | "Mapper must be a function"                   | Invalid mapper         |
| `filterAsync`                   | "Predicate must be a function"                | Invalid predicate      |
| `allSettled`, `raceWithTimeout` | "First argument must be an array of promises" | Invalid promises array |
| `createQueue`                   | "Concurrency must be a positive number"       | Invalid concurrency    |

## Security Considerations

1. **Input Validation**: Validate inputs using `isEmpty()` or custom checks
2. **Sanitization**: Use `escapeHtml()` and `escapeRegExp()` for user input
3. **Immutability**: Use `deepClone()` to avoid unintended mutations
4. **Concurrency Limits**: Set reasonable `concurrency` in `parallel()` and
   `createQueue()`
5. **Sensitive Data**: Mask sensitive data with `maskString()`

## TypeScript Support

The module includes JSDoc comments for IDE support. For TypeScript projects, you
can use these annotations or create declaration files.

```typescript
interface User {
  name: string;
  age?: number;
}

const obj: User = pick({ name: 'John', age: 30 }, ['name']);
```

## Performance Tips

1. **Deep Operations**: Limit `deepMerge()` and `deepClone()` for large objects
2. **Concurrency**: Optimize `concurrency` in `parallel()`, `mapAsync()`, and
   `createQueue()`
3. **Debouncing/Throttling**: Tune `wait` times in `debounce()` and `throttle()`
4. **Caching**: Cache results of `parseDate()` or `formatDate()` for frequent
   use

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
