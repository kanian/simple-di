# Dependency Injection System

This project is a TypeScript-based Dependency Injection (DI) system designed to facilitate the management of dependencies in a modular and scalable way. It supports features such as singleton and transient lifecycles, autowiring of dependencies, and custom token names for services.

## Features

- **Service Registration**: Register classes or values as services using decorators or direct registration.
- **Autowiring**: Automatically resolve and inject dependencies based on constructor parameters.
- **Singleton and Transient Lifecycles**: Support for singleton (single instance) and transient (new instance per request) service lifecycles.
- **Custom Tokens**: Use strings, symbols, or classes as unique identifiers for services.
- **Module System**: Organize services into modules for better structure and reusability.
- **Value and Factory Providers**: Register static values or use factory functions to create service instances.

## Installation

To install the dependencies, run:

```bash
npm install
```

## Usage

### Registering a Service

Use the `@Service` decorator to register a class as a service:

```typescript
@Service()
class MyService {
  getValue() {
    return 'Hello, World!';
  }
}
```

### Injecting Dependencies

Use the `@Inject` decorator to inject dependencies into a class using tokens:

```typescript
const MY_SERVICE_TOKEN = Symbol('MyServiceToken');

@Service({ token: MY_SERVICE_TOKEN })
class MyService {
  getValue() {
    return 'Hello, World!';
  }
}

@Service()
class ConsumerService {
  constructor(@Inject(MY_SERVICE_TOKEN) private myService: MyService) {}

  getValue() {
    return this.myService.getValue();
  }
}
```

### Transient Services

Transient services are created anew each time they are requested. To define a transient service, specify the lifecycle option as 'transient' in the `@Service` decorator and use a token for registration:

```typescript
const TRANSIENT_SERVICE_TOKEN = Symbol('TransientServiceToken');

@Service({ token: TRANSIENT_SERVICE_TOKEN, lifecycle: 'transient' })
class TransientService {
  public value: number = Math.random();
}

// Usage
const instance1: TransientService = inject(TRANSIENT_SERVICE_TOKEN);
const instance2: TransientService = inject(TRANSIENT_SERVICE_TOKEN);

console.log(instance1.value !== instance2.value); // true, different instances
```

### Initializing the Container

Call `initializeContainer()` to resolve all registered services:

```typescript
initializeContainer();
```

### Using Modules

Define modules to group related services:

```typescript
const myModule = new Module({
  providers: [MyService, ConsumerService],
});
```

### Bootstrapping the Application

Use the `bootstrap` function to initialize the application with a root module:

```typescript
bootstrap(myModule);
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License.
