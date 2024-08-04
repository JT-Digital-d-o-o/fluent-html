# Lambda.html

## Overview

Lambda.html is a TypeScript-based HTML builder framework designed to simplify the creation of HTML documents programmatically. It leverages functional programming principles to provide a declarative and extensible approach to building web interfaces. This framework is particularly useful for developers looking to create dynamic web pages with clean, maintainable code, and integrates seamlessly with CSS frameworks like Tailwind CSS. A core focus of Lambda.html is to facilitate the production of robust software, ensuring reliability and maintainability in web development projects.

### Key Features

- **Robustness**: Designed with a focus on producing robust software, Lambda.html emphasizes error handling, predictable behaviors, and compatibility across different environments.
- **HTMX Integration**: Easily integrate with HTMX for modern AJAX-driven web applications without writing JavaScript.
- **Extensible and Customizable**: Extend the framework with custom components and attributes to fit any use case.
- **Type Safety**: Built with TypeScript to ensure reliability and maintainability through static type checking.
- **Tailwind CSS Compatibility**: Completely orthogonal to Tailwind CSS, allowing for frictionless integration without any conflicts, making it ideal for developers who use Tailwind for styling.
- **Functional and Declarative Syntax**: Write HTML elements in a clear and expressive way using pure functions.

### Core Concepts

- **Robust Design**: Lambda.html is built to handle errors gracefully, provide clear and helpful error messages, and ensure that components behave consistently across different browsers and platforms.
- **Seamless Style Integration**: Use any CSS framework, such as Tailwind CSS, without modifications or special configurations. Simply pass the class names as attributes to the HTML elements.

### Installation

To integrate Lambda.html into your project, follow these steps:

1. **Install via npm**:
   ```bash
   npm install lambda.html
   ```

2. **Import in your project**:
   ```typescript
   import { Div, Button, Text } from 'lambda.html';
   ```

3. **Start building your HTML**:
   ```typescript
   const myButton = Button({
     class: "btn btn-primary",
     child: Text("Click Me"),
     htmx: hx("/submit-form", {
       method: "post",
     })
   });

   const myPage = Div({
     child: myButton
   });

   console.log(myPage());
   ```

This section provides a high-level overview of what Lambda.html is about, its main features, and how to get started quickly. The next sections will delve into detailed API documentation, comprehensive examples, and best practices.

## Composability and Reusable Components

Lambda.html is designed with a strong emphasis on **composability**, a core principle that allows developers to build complex UIs from smaller, reusable components. Since the framework utilizes pure functions, each component can be composed with others without side effects, ensuring predictable and consistent behavior.

### Creating Reusable Components

To leverage the full power of composability, we recommend defining reusable components as pure functions. Here’s how you can create and use a reusable component in Lambda.html:

### Example: Call View Component

Consider a scenario where you need to display user contact information repeatedly across different parts of your application. You can create a `CallView` component to handle this:

```typescript
import { Div, Img, P, A, Text, VStack } from 'lambda.html';

// Reusable CallView component
function CallView(name: string, phone: string): HTML {
  return Div({
    class: "call-view",
    child: VStack([
      Img({ src: "../images/call.svg" }),
      Div({
        child: VStack([
          P({ child: Text(name) }),
          P({ class: "orange", child: A({ href: `tel:${phone}`, child: Text(phone) }) }),
        ]),
      })
    ])
  });
}

// Usage of CallView in an application
const contactInfo = VStack([
  CallView("Alice Johnson", "+1234567890"),
  CallView("John Wick", "+9876543210"),
]);

console.log(contactInfo());
```

This `CallView` component encapsulates all the HTML necessary to display a contact card, including an image, name, and clickable phone number. It can be easily reused wherever needed in your application.

### Benefits of Composability

1. **Modularity**: Components can be developed, tested, and maintained in isolation, then composed to build complex interfaces.
2. **Reusability**: Once a component is created, it can be reused across different parts of an application or even across different projects.
3. **Maintainability**: Changes to a single component are localized, which reduces the risk of unintended side effects elsewhere in the application.

### Best Practices for Component Design

- **Keep components small and focused**: Each component should have a single responsibility.
- **Use descriptive names**: Function and component names should clearly describe their purpose or output.
- **Parameterize flexibly**: Allow components to accept parameters for customization, making them more adaptable to different contexts.

By following these guidelines and utilizing the composability of Lambda.html, developers can build robust, maintainable, and scalable web applications.

## Examples

```typescript
import { Div, Text } from 'lambda.html';

const greeting = Div({
  class: "p-4 text-center text-lg",
  child: Text("Hello, world!")
});

console.log(greeting());
```

This example creates a `div` with padding and centered text, demonstrating how easy it is to apply Tailwind CSS classes.

### Conditional Rendering with IfThen and IfThenElse

Lambda.html provides `IfThen` and `IfThenElse` for conditional rendering of HTML elements. Here's how you can use these functions:

```typescript
import { Div, Text, IfThen, IfThenElse } from 'lambda.html';

const userLoggedIn = true;
const userName = "Alice";

const userProfile = IfThenElse(
  userLoggedIn,
  () => Text(`Welcome back, ${userName}!`),
  () => Text("Please log in.")
);

const loginMessage = IfThen(
  userLoggedIn,
  () => Div({
    child: userProfile
  })
);

console.log(loginMessage());
```

This example shows how to conditionally render different text based on whether the user is logged in.

### Looping with MapJoin

`MapJoin` is used to render lists of elements. It's particularly useful for creating dynamic lists or tables. Here's an example:

```typescript
import { Ul, Li, MapJoin, Text } from 'lambda.html';

const items = ["Apple", "Banana", "Cherry"];

const itemList = Ul({
  child: MapJoin(items, item => Li({
    child: Text(item)
  }))
});

console.log(itemList());
```

This example creates an unordered list of fruit names, demonstrating how `MapJoin` can be used to iterate over an array of data.

### Combined Example: A Dynamic User Profile

Let's combine these concepts to create a more complex example:

```typescript
import { Div, H1, P, IfThenElse, MapJoin, Text } from 'lambda.html';

const user = {
  name: "Alice",
  loggedIn: true,
  interests: ["Reading", "Hiking", "Coding"]
};

const userProfile = Div({
  child: VStack([
    H1({
      child: Text(`Profile: ${user.name}`)
    }),
    P({
      child: IfThenElse(
        user.loggedIn,
        () => Text("Status: Online"),
        () => Text("Status: Offline")
      )
    }),
    P({
      child: Text("Interests:")
    }),
    Ul({
      child: MapJoin(user.interests, interest => Li({
        child: Text(interest)
      }))
    })
  ])
});

console.log(userProfile());
```

This example creates a user profile page that displays the user's name, online status, and a list of interests. It showcases how to use `IfThenElse` for conditional rendering and `MapJoin` for looping through an array, all within a structured layout.

These examples should help you understand how to use the core abstractions of Lambda.html to build robust and dynamic HTML structures.

### Using HTMX for Interactive Elements

HTMX allows you to add interactivity to your web pages without writing JavaScript. Here's an example of how to use HTMX Lambda.html to handle form submission:

```typescript
import { Form, Input, Button, Text } from 'lambda.html';

const interactiveForm = Form({
  action: "/submit",
  method: "post",
  htmx: hx("/submit-form", {
    method: "post",
    swap: "outerHTML",
    trigger: "submit"
  }),
  child: VStack([
    Input({
      type: "text",
      name: "username",
      placeholder: "Enter your username"
    }),
    Button({
      type: "submit",
      child: Text("Submit")
    })
  ])
});

console.log(interactiveForm());
```

This example creates a form that submits data to "/submit-form" using a POST request when the form is submitted, and the response will replace the form element in the DOM.

### Using Tailwind CSS for Styling

Tailwind CSS is a utility-first CSS framework that can be used seamlessly with Lambda.html. Here's how you can style your elements using Tailwind CSS classes:

```typescript
import { Div, H1, P, Text } from 'lambda.html';

const styledPage = Div({
  class: "bg-gray-200 p-4",
  child: VStack([
    H1({
      class: "text-xl font-bold text-center text-blue-500",
      child: Text("Welcome to Lambda.html")
    }),
    P({
      class: "text-base text-gray-700",
      child: Text("Start building beautiful and interactive web pages easily.")
    })
  ])
});

console.log(styledPage());
```
