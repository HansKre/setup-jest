test: function (modulePath) {
    return (
      // .ts or .tsx but not .test.ts or .test.tsx or __tests__
      modulePath.match(/\.tsx?$/) &&
      !modulePath.includes(".test.") &&
      !modulePath.includes("__tests__")
    );
  },