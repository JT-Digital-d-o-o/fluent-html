# Lambda.html

## Overview

Lambda.html is a TypeScript HTML builder framework designed to streamline the creation of HTML documents. It uses functional programming to offer a declarative way to build web interfaces, ensuring clean and maintainable code. It works well with CSS frameworks like Tailwind CSS and is ideal for developers aiming for high reliability and maintainability in web projects.

## Features

- **Robustness**: Focuses on creating predictable and reliable software with zero dependencies.
- **HTMX Integration**: Supports easy integration with HTMX for AJAX-driven applications.
- **Extensibility**: Allows for custom components and attributes to suit diverse needs.
- **Type Safety**: Utilizes TypeScript for static type checking, enhancing code reliability.
- **Tailwind CSS Compatibility**: Ensures smooth integration with Tailwind CSS for styling.

## Core Concepts

- **Robust Design**: Built to produce robust, predictable components.
- **Seamless Style Integration**: Compatible with any CSS framework, facilitating easy styling by passing class names directly to HTML elements.

### Installation

To get started with Lambda.html, follow these simple steps:

1. **Install via npm**:
   ```bash
   npm install lambda.html
   ```

2. **Import in your project**:
   ```typescript
   import { Div, Button, Text, render } from 'lambda.html';
   ```

3. **Example usage**:
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

   console.log(render(myPage));
   ```

This section outlines how to install and begin using Lambda.html in your projects. For detailed API documentation, comprehensive examples, and best practices, refer to the subsequent sections.

## Composability and Reusable Components

Lambda.html emphasizes **composability**, allowing developers to construct complex UIs from smaller, reusable components. Utilizing pure functions, these components can be combined without side effects, ensuring consistent behavior.

### Creating Reusable Components

For effective composability, define reusable components as pure functions. Here’s an example of creating a `ContactDetailsView` component in Lambda.html:

```typescript
import { Div, Img, P, A, Text, HStack, VStack, render } from 'lambda.html';

// Define a reusable component as a pure function.
function ContactDetailsView(name: string, phone: string): View {
  return Div({
    child: HStack([
      Img({ src: "call.svg" }),
      Div({
        child: VStack([
          P({ child: Text(name) }),
          P({ 
            class: "orange", 
            child: A({ href: `tel:${phone}`, child: Text(phone) }) 
          }),
        ]),
      })
    ])
  });
}

const contactInfo = VStack([
  ContactDetailsView("Alice Johnson", "+1234567890"),
  ContactDetailsView("John Wick", "+9876543210"),
]);

console.log(render(contactInfo));
```

This example demonstrates how to encapsulate and reuse a contact card component, which includes an image, name, and clickable phone number, across different parts of your application.

### Benefits of Composability

1. **Modularity**: Components are developed, tested, and maintained independently, simplifying the construction of complex interfaces.
2. **Reusability**: Components can be reused throughout an application or across multiple projects, enhancing efficiency.
3. **Maintainability**: Localized changes in components minimize unintended impacts, improving application stability.

### Best Practices for Component Design

- **Focus**: Keep components small and dedicated to a single task.
- **Clarity**: Use names that clearly indicate what the component does.
- **Flexibility**: Design components to accept parameters, allowing for customization and broader use.

These practices, combined with Lambda.html's composability, enable the development of robust, maintainable, and scalable web applications.

## Examples

```typescript
import { Div, Text, render } from 'lambda.html';

const greeting = Div({
  class: "p-4 text-center text-lg",
  child: Text("Hello, world!")
});

console.log(render(greeting));
```

This example creates a `div` with padding and centered text, demonstrating how easy it is to apply Tailwind CSS classes.

### Conditional Rendering with IfThen and IfThenElse

Lambda.html provides `IfThen` and `IfThenElse` for conditional rendering of HTML elements. Here's how you can use these building blocks:

```typescript
import { Div, Text, IfThen, IfThenElse, render } from 'lambda.html';

function UserProfile(state: string | undefined): View {
  return IfThenElse(
    state,
    () => Text(`Welcome back, ${state}!`),
    () => Text("Please log in.")
  );
);

const profile = UserProfile("Alice");
console.log(render(profile));
```

This example shows how to conditionally render different text based on whether the user is logged in.

### Conditional Rendering with SwitchCase

```typescript
import { Text, SwitchCase, render } from 'lambda.html';

// Example user data
const user = {
  name: "Alice",
  role: "admin"
};

// Define the SwitchCase component for conditional rendering
const greeting = SwitchCase(
  [
    {
      condition: () => user.role === "admin",
      component: Text("Welcome, admin!")
    },
    {
      condition: () => user.role === "user",
      component: Text("Welcome, user!")
    },
    {
      condition: () => user.role === "guest",
      component: Text("Welcome, guest!")
    }
  ], 
  () => Text("Role not recognized."),
);

// Render the greeting based on user role
console.log(render(greeting));
```

This example demonstrates how `SwitchCase` simplifies conditional rendering in Lambda.html. By encapsulating conditions within a structured format, it enhances code clarity and maintainability, focusing on what to render rather than the logic to determine it.

### Looping with ForEach

`ForEach` is used to render lists of elements. Here's an example:

```typescript
import { Ul, Li, ForEach, Text, render } from 'lambda.html';

const items = ["Apple", "Banana", "Cherry"];

const itemList = Ul({
  child: ForEach(items, item => Li({
    child: Text(item)
  }))
});

console.log(render(itemList));
```

This example creates an unordered list of fruit names, demonstrating how `ForEach` can be used to iterate over an array of data.

Sometimes, it is useful to know the index of the item. Use `ForEach1` in those cases:

```typescript
import { Div, Input, Label, ForEach1, Text, render } from 'lambda.html';

// Example tasks array
const tasks = [
  "Finish the report",
  "Call the client",
  "Prepare meeting agenda",
];

// Function to render a single task
function TaskView(task: string, index: number): View {
  return Div({
    child: VStack([
      Input({ type: "checkbox", id: `task-${index + 1}` }),
      Text(`${index + 1}. ${task}`),
    ]),
  });
}

// Create the list of tasks using ForEach1
function TasksView(tasks: string[]): View {
  return ForEach1(tasks, TaskView);
}

// Render the task list
const view = TasksView(tasks);
console.log(render(view));
```

### Combined Example: A Dynamic User Profile

Let's combine these concepts to create a more complex example:

```typescript
import { Div, H1, P, IfThenElse, ForEach, Text, render } from 'lambda.html';

function UserProfileView(name: string, loggedIn: boolean, interests: string[]): View {
  return Div({
    child: VStack([
      H1({
        child: Text(`Profile: ${name}`)
      }),
      IfThenElse(
        isLoggedIn,
        () => P({ child: Text("Status: Online") }),
        () => P({ child: Text("Status: Offline") }),
      ),
      P({
        child: Text("Interests:")
      }),
      Ul({
        child: ForEach(interests, interest => Li({
          child: Text(interest)
        }))
      })
    ])
  });
}

const userProfile = UserProfileView("Alice", true, ["Reading", "Hiking", "Coding"]);
console.log(render(userProfile));
```

This example demonstrates creating a dynamic user profile page using Lambda.html. It incorporates the user's name, online status, and interests list, utilizing `IfThenElse` for conditional rendering and `ForEach` for iterating over arrays. This approach exemplifies how to build complex and interactive HTML structures with Lambda.html's functional and declarative syntax.

### Using HTMX for Interactive Elements

```typescript
import { Form, Input, Button, Text, render } from 'lambda.html';

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

console.log(render(interactiveForm));
```

This example demonstrates how to use HTMX with Lambda.html to create an interactive form. The form submits data to "/submit-form" using a POST request upon submission, and the server's response replaces the form in the DOM, enhancing user experience without full page reloads.

### Using Tailwind CSS for Styling

```typescript
import { Div, H1, P, Text, render } from 'lambda.html';

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

console.log(render(styledPage));
```

### 1. **Dashboard Layout**

Create a dashboard layout with a sidebar, header, and content area. This example can demonstrate how to use `Div`, `VStack`, and `HStack` to create a layout structure, and how to integrate interactive elements using HTMX.

```typescript
import { Div, VStack, HStack, Button, Text, render } from 'lambda.html';

function DashboardLayout(sidebarContent: View, mainContent: View): View {
  return Div({
    class: "min-h-screen flex",
    child: HStack({
      children: [
        Div({ class: "w-64 bg-gray-800 text-white", child: sidebarContent }),
        Div({
          child: VStack([
            Div({ class: "bg-gray-200 p-4 shadow", child: Text("Header") }),
            mainContent
          ])
        })
      ]
    })
  });
}

function MyDashboard(): View {
  return DashboardLayout(
    VStack([
      Button({ child: Text("Home"), class: "p-2 hover:bg-gray-700" }),
      Button({ child: Text("Settings"), class: "p-2 hover:bg-gray-700" })
    ]),
    Div({ class: "p-4", child: Text("Welcome to the dashboard!") }),
  );
}

const dashboard = MyDashboard();
console.log(render(dashboard));
```

### 2. **Interactive Data Table**

Build a data table component that supports sorting and pagination. This component can utilize `ForEach` to render rows based on data and `IfThenElse` for conditional rendering of table states.

```typescript
import { Div, Button, Text, ForEach, IfThenElse, render } from 'lambda.html';

function DataTable(headers: string[], data: any[]): View {
  return Table({
    child: VStack([
      Thead({
        child: Tr({
          child: ForEach(headers, header => Th({ child: Text(header), class: "font-bold p-2" }))
        })
      }),
      Tbody({
        child: ForEach(data, row => 
          Tr({
            child: ForEach(Object.values(row), (value: any) => Td({ child: Text(value.toString()), class: "p-2" }))
          })
        )
      })
    ])
  });
}

const headers = ["Name", "Age", "Location"];
const data = [
  { Name: "Alice", Age: 28, Location: "New York" },
  { Name: "Bob", Age: 25, Location: "California" }
];

const table = DataTable(headers, data);
console.log(render(table));
```
