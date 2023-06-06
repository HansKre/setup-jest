# How to do testing

## Tech stack

- [Jest](https://facebook.github.io/jest/) as a testing framework specifically built for React which also serves as a test runner for all our tests.
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) as a very light-weight solution for testing React components. It provides light rendering of components and utility functions on top of `react-dom` and `react-dom/test-utils`, in a way that encourages better testing practices.
- [Mock Service Worker (MSW)](https://mswjs.io/) as a seamless REST/GraphQL API mocking library for browser and Node.js
- [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch) as a `window.fetch` polyfill

## Initial setup of jest and react-testing-library

[how-to](https://swizec.com/blog/how-to-configure-jest-with-typescript/)
[cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)

## Running tests once

Running all tests:

```sh
npm test
```

Running an individual test (e.g. `/__/tests__/MyComponent.test.js`):

```sh
npm test MyComponent
```

To run both `MyComponent.test.js` and `MyControl.test.js` suite of tests:

```sh
npm test MyCo
```

## Running tests in development

To let `Jest` watch for changes in your tests as well as tested code, run:

```sh
npm run test:watch
```

## Running tests for production

Tests are executed automatically during the build process.

## Naming test files

Tests should be named `[filename].test.ts` and placed into the components `/__tests__` folder.

For example, the tests for `Link.tsx` shoud be in the file `/Link/__tests__/Link.test.ts`.

Note that this narrows down the [default](https://jestjs.io/docs/configuration#testmatch-arraystring) of `Jest` but at the same time allows us to put non-test-files into `__tests__` folder, such as:

- utility-functions
- mocks
- fixtures
- outsourced testing-code into functions

without worrying about `Jest`'s auto-discovery.

This also helps us keeping our code base consistent in the sense that we don't have to consider possible alternatives like using `[filename].test.ts` or `[filename].spec.ts` or the `__tests__` folder.

## Principles

The scope of automated tests is to increase confidence in making changes to an application and its resilience to change.

In general, writing tests is a very tideous and time consuming task. Still, it can add more value than if not done at all.

An important guiding principle for writing tests should be:

> [The more your tests resemble the way your software is used, the more confidence they can give you.](https://testing-library.com/docs/guiding-principles/)

This means the number of tests, their granularity (e.g. Tests vs. Integration Tests) should resemble the level of complexity and confidence need of the application and code.

In PC!neo, we shall focus on main components (e.g. pages, containers, dialogs).

Testing these components from a user's perspective not only makes sure that user-facing functionality is tested but also crucial parts of the underlying components as well.

It shall be developer's decision to deviate in cases where underlying components are of utmost importance or easier tested with a test themselves.

### Bad test principle

> No test is better than a bad one.

Writing a poor test:

- Gives the illusion your code is more secure or reliable than it actually is.
- Functions equivalent to a bad comment, in that it leads the next developer
  into erroneous assumptions.
- Adds to future work by requiring updates to the test for irrelevant code
  changes.

#### Test coverage

There is no test coverage target to avoid creation of bad tests just to satisfy test coverage.

### Input/output principle

> A test verifies an output matches an expected input.

For frontend, this would be that when you provide
properties X to a component, then the visual functionality responds with Y.

### Blackbox principle

> A good test does not tell the object how it should do its job but should
> only compare inputs to outputs.

Consider a test for a form. A good test would not test the order of
the form fields. Instead, it would verify that the inputs to the form fields
lead to a certain backend call when submit is clicked.

#### Selectors

Using CSS classnames for component selection can be very brittle to code change. `react-testing-library` has a set of selectors which foster the blackbox principle as well as accessibility. Usage of `querySelector` is discouraged wherever possible.

This may require that components under test are extended with additional/proper aria [`role`](https://www.w3.org/TR/2014/REC-wai-aria-20140320/roles#role_definitions) (which in turn helps with accessibility) or `data-testid` attributes.

### Scalability principle

> test quality is directly proportionate to how much code can change
> without having to touch the test.

A test is not a test to verify the code never
changes. Poor tests are written so that every time you make a tiny change
to the code, you have to update the test. A good test suite allows a
lot of flexibility in _how_ the code is written so that future refactoring can
occur without having to touch the original tests.

### Increasing complexity principle

> The ordering of tests in a suite should proceed from least specific to
> most specific.

Jest runs all tests in the order in which they are provided, regardless of the
depth of `describe()` blocks you provide. We can use this to help us write tests
that will help the next developer debug what they broke.

The idea here is that if they were to break a test, the next developer
should be able to tell from the order in which the tests broke what they should
do to fix things.

For example, good tests will verify the arguments to a function in a test
prior to a test that validates the output. If you do not test this, then simply
throwing an error saying that output was incorrect will lead the next developer
into thinking they may have broken the entire functionality of the object rather
than simply letting them know they had an invalid input.

### Broken functionality principle

> Generally, a test should not test exactly how the output appears, it
> should test that the functionality has an expected _general_ response to an
> input change.

This piggybacks the **scalability principle** and applies primarily to frontend
development. As a general guideline, frontends should be flexible enough so
that the UX or design can change while touching the least amount of code
possible. So for example, a poor test would verify the color of a button
when it is hovered. This would be a poor test, because if you decide to
test a slightly different color on the button the test will break. A better
test would verify that the button's CSS classname is assigned properly on
hover or test for something completely different.

## Typical use cases to test

1. Component renders with initial props
2. Outputs for expected input arguments
   1. Valid inputs translate into valid browser requests
   2. Valid server response is translated into expected objects
3. Handles invalid input
   1. Invalid inputs are caught before being sent to the server
4. Handles error cases (e.g. server errors)
   1. Server errors are handled gracefully (e.g. proper error is shown)

### Mocking API calls

As tests should never issue actual API requests, API calls should be mocked. [Mocking in Jest](https://facebook.github.io/jest/docs/en/mock-functions.html)
involves wrapping existing functions (like an API call function) with an
alternative.

Best approach for mocking API calls is using [Mock Service Worker (MSW)](https://mswjs.io/) but you might run into edge cases where this is not possible.

#### Mocking ES6-modules

To instruct Jest to swap all future imports of a module with a generic mock:

```ts
jest.mock("./MyApi");
```

This will mock the entire `utils/hooks` module and provide an implementation for `useToasts`

```ts
const mockAddToast = jest.fn().mockName("addToast");
jest.mock("utils/hooks", () => ({
  __esModule: true,
  useToasts: () => ({ addToast: mockAddToast }),
}));
```

We can have partial mocks by letting `Jest` use the acutal implementation along with a mock:

```ts
const mockAddToast = jest.fn().mockName("addToast");
jest.mock("utils/hooks", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  useFetch: jest.requireActual("utils/hooks").useFetch,
  useToasts: () => ({ addToast: mockAddToast }),
}));
```

## `waitFor` vs `act`

Detailed explanation can be found [here](https://medium.com/@AbbasPlusPlus/act-and-waitfor-react-testing-library-dba78bb57e30).

**TL;DR:**

- The `act` function is a utility provided by the React Testing Library that wraps around your code, ensuring that all updates related to state changes, effects, and other asynchronous actions are flushed before proceeding. This is crucial when testing components with asynchronous behavior, as it helps maintain a consistent and predictable test environment.
- The `waitFor` function is another utility provided by the React Testing Library that helps deal with asynchronous behavior in your components. It is used when you need to wait for an element to appear or change, or **when you expect some action to occur after a certain period of time**. `waitFor` returns a Promise that resolves when the specified condition is met. It **retries the condition every 50ms (by default) until it passes or times out after 1000ms (by default)**.

## Queries

Overview of all available queries [here](https://testing-library.com/docs/queries/about/)

## Types of Queries

- Single Elements
  - `getBy...`: Returns the matching node for a query, and throw a descriptive
    error if no elements match _or_ if more than one match is found (use
    `getAllBy` instead if more than one element is expected).
  - `queryBy...`: Returns the matching node for a query, and return `null` if no
    elements match. This is useful for asserting an element that is not present.
    Throws an error if more than one match is found (use `queryAllBy` instead if
    this is OK).
  - `findBy...`: Returns a Promise which resolves when an element is found which
    matches the given query. The promise is rejected if no element is found or
    if more than one element is found after a default timeout of 1000ms. If you
    need to find more than one element, use `findAllBy`.
- Multiple Elements
  - `getAllBy...`: Returns an array of all matching nodes for a query, and
    throws an error if no elements match.
  - `queryAllBy...`: Returns an array of all matching nodes for a query, and
    return an empty array (`[]`) if no elements match.
  - `findAllBy...`: Returns a promise which resolves to an array of elements
    when any elements are found which match the given query. The promise is
    rejected if no elements are found after a default timeout of `1000`ms.
    - `findBy` methods are a combination of `getBy*` queries and
      [`waitFor`](../dom-testing-library/api-async.mdx#waitfor). They accept the
      `waitFor` options as the last argument (i.e.
      `await screen.findByText('text', queryOptions, waitForOptions)`)

### Full list of single element queries

- `getByLabelText()` finds a form element by its `label`;
- `getByPlaceholderText`() finds a form element by its placeholder text;
- `getByText`() finds an element by its text content;
- `getByAltText`() finds an image by its alt text;
- `getByTitle`() finds an element by its title attribute;
- `getByDisplayValue`() finds a form element by its value;
- `getByRole`() finds an element by its ARIA role;
- `getByTestId`() finds an element by its test ID.

## Priority of using queries

Based on [the Guiding Principles](https://testing-library.com/docs/guiding-principles/), your test should
resemble how users interact with your code (component, page, etc.) as much as
possible. With this in mind, we recommend this order of priority:

1. **Queries Accessible to Everyone** Queries that reflect the experience of
   visual/mouse users as well as those that use assistive technology.
   1. `getByRole`: This can be used to query every element that is exposed in
      the
      [accessibility tree](https://developer.mozilla.org/en-US/docs/Glossary/AOM).
      With the `name` option you can filter the returned elements by their
      [accessible name](https://www.w3.org/TR/accname-1.1/). This should be your
      top preference for just about everything. There's not much you can't get
      with this (if you can't, it's possible your UI is inaccessible). Most
      often, this will be used with the `name` option like so:
      `getByRole('button', {name: /submit/i})`. Check the
      [list of roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques#Roles).
   2. `getByLabelText`: This method is really good for form fields. When
      navigating through a website form, users find elements using label text.
      This method emulates that behavior, so it should be your top preference.
   3. `getByPlaceholderText`:
      [A placeholder is not a substitute for a label](https://www.nngroup.com/articles/form-design-placeholders/).
      But if that's all you have, then it's better than alternatives.
   4. `getByText`: Outside of forms, text content is the main way users find
      elements. This method can be used to find non-interactive elements (like
      divs, spans, and paragraphs).
   5. `getByDisplayValue`: The current value of a form element can be useful
      when navigating a page with filled-in values.
2. **Semantic Queries** HTML5 and ARIA compliant selectors. Note that the user
   experience of interacting with these attributes varies greatly across
   browsers and assistive technology.
   1. `getByAltText`: If your element is one which supports `alt` text (`img`,
      `area`, `input`, and any custom element), then you can use this to find
      that element.
   2. `getByTitle`: The title attribute is not consistently read by
      screenreaders, and is not visible by default for sighted users
3. **Test IDs**
   1. `getByTestId`: The user cannot see (or hear) these, so this is only
      recommended for cases where you can't match by role or text or it doesn't
      make sense (e.g. the text is dynamic).

### TextMatch Examples

Given the following HTML:

```html
<div>Hello World</div>
```

**_Will_ find the div:**

```javascript
// Matching a string:
screen.getByText("Hello World"); // full string match
screen.getByText("llo Worl", { exact: false }); // substring match
screen.getByText("hello world", { exact: false }); // ignore case

// Matching a regex:
screen.getByText(/World/); // substring match
screen.getByText(/world/i); // substring match, ignore case
screen.getByText(/^hello world$/i); // full string match, ignore case
screen.getByText(/Hello W?oRlD/i); // substring match, ignore case, searches for "hello world" or "hello orld"

// Matching with a custom function:
screen.getByText((content, element) => content.startsWith("Hello"));
```

**_Will not_ find the div:**

```javascript
// full string does not match
screen.getByText("Goodbye World");

// case-sensitive regex with different case
screen.getByText(/hello world/);

// function looking for a span when it's actually a div:
screen.getByText((content, element) => {
  return (
    element.tagName.toLowerCase() === "span" && content.startsWith("Hello")
  );
});
```

### Further helpful functions

#### `tohaveProperty` and `stringMatching`

```ts
expect({
  name: "Peter Parker",
}).toHaveProperty("name", expect.stringMatching(/peter/i));
```

#### Combine query with Regex-match of name

```ts
const span = screen.getByRole("presentation", { name: /time/i });
```

#### Inspiration for regex text-matchers

```ts
expect(span).toHaveTextContent(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);
```

#### `toBe` vs `toEqual` vs `toMatch`

In Jest, there are several functions used for making assertions in tests, including `toBe`, `toEqual`, and `toMatch`. Here's a breakdown of their differences:

1. `toBe`: The `toBe` function is used for strict equality checks. It uses the `===` operator to compare the values and ensures that both the type and value match. For example:

   ```javascript
   test("toBe example", () => {
     const value = 5;
     expect(value).toBe(5); // Passes
     expect(value).toBe("5"); // Fails
   });
   ```

2. `toEqual`: The `toEqual` function is used for deep equality checks. It recursively checks the values of all properties in objects or elements in arrays to ensure that they are the same. For example:

   ```js
   test("toEqual example", () => {
     const obj1 = { a: 1, b: 2 };
     const obj2 = { a: 1, b: 2 };
     const arr1 = [1, 2, 3];
     const arr2 = [1, 2, 3];

     expect(obj1).toEqual(obj2); // Passes
     expect(arr1).toEqual(arr2); // Passes
   });
   ```

3. `toMatch`: The `toMatch` function is used to compare strings using regular expressions. It checks if the value matches the pattern specified by the regular expression. For example:

   ```js
   test("toMatch example", () => {
     const str = "Hello, World!";

     expect(str).toMatch(/hello/i); // Passes (case-insensitive match)
     expect(str).toMatch("World"); // Passes
   });
   ```

In summary, `toBe` is used for strict equality checks, `toEqual` is used for deep equality checks, and `toMatch` is used for comparing strings using regular expressions. Choose the appropriate function based on the type of comparison you want to make in your tests.

#### Negation of assertions

```ts
expect(screen.queryByRole("checkbox")).not.toBeChecked();
```

#### Assert CSS styles

```ts
expect(checkboxLabel).toHaveStyle("display: none");
```
