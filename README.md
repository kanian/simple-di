# Misc: Dependency Injection Container

This document explains the inner workings of the custom Dependency Injection (DI) container implemented in this project. The DI system supports both **class-based dependencies** and **value-based dependencies**. Let’s break down how it works and how you can use it.
*NB*: They are other utilities here that are completely unrelated. The DI container will be moved soon.
## Key Concepts

### 1. **Service Registration**
The DI container allows you to register dependencies in two ways:
- **Class-based registration**: for autowired services
- **Value-based registration**: for constants or pre-instantiated objects

### 2. **Dependency Resolution**
When a service is requested, the container:
- Checks if the token corresponds to a value or class
- If it’s a class, it recursively resolves and injects its dependencies
- If it’s a value, it returns the registered value directly

---

## API

### **Registering a value**
You can register constants or pre-instantiated objects using `registerValue`.

```typescript
// Register a constant
registerValue('AGE', 42);

// Register an instance of a class
class Helper {
  getValue() { return 'helper'; }
}
registerValue('HELPER', Helper); // Instantiates Helper automatically
```

### **Class-based dependency injection**
You can use decorators to declare services and inject dependencies.

```typescript
@Service()
class ServiceA {
  getValue() { return 'A'; }
}

@Service()
class ServiceB {
  getValue() { return 'B'; }
}

@Service()
class AutowiredService {
  constructor(private serviceA: ServiceA, private serviceB: ServiceB) {}

  getValue() {
    return this.serviceA.getValue() + this.serviceB.getValue();
  }
}
```

In this case, `AutowiredService` has dependencies on `ServiceA` and `ServiceB`. The DI container will autowire these services based on their class types.

### **Injecting dependencies**
Use the `inject` function to retrieve an instance of a service:

```typescript
const instance: AutowiredService = inject(AutowiredService);
console.log(instance.getValue()); // Outputs: "AB"
```

### **Handling mixed dependencies**
You can also mix class-based and value-based dependencies.

```typescript
@Service()
class MixedService {
  constructor(
    @Inject('HELPER') public helper: Helper,
    @Inject('AGE') public age: number
  ) {}

  getValues() {
    return { helper: this.helper.getValue(), age: this.age };
  }
}

const instance = inject(MixedService);
console.log(instance.getValues()); // Outputs: { helper: 'helper', age: 42 }
```

---

## How it works

1. **`registerValue(token, value)`**
   - If `value` is a class, it's instantiated immediately.
   - Otherwise, the value is stored directly.

2. **`autowireService(target)`**
   - Uses `Reflect.getMetadata('design:paramtypes', target)` to get constructor dependencies.
   - Registers the class constructors in the service registry.

3. **`inject(token)`**
   - If the token is a string or symbol, it fetches the value or constructor.
   - If it’s a class, it resolves its dependencies recursively.

---

## Example Test

Here’s a simple test showing how autowiring and value injection work together:

```typescript
test('should autowire dependencies and inject values', () => {
  @Service()
  class ServiceA {
    getValue() { return 'A'; }
  }

  registerValue('AGE', 42);

  @Service()
  class MixedService {
    constructor(private serviceA: ServiceA, @Inject('AGE') public age: number) {}
    getValues() { return { value: this.serviceA.getValue(), age: this.age }; }
  }

  const instance = inject(MixedService);
  expect(instance.getValues()).toEqual({ value: 'A', age: 42 });
});
```

---

This DI system is lightweight, flexible, and supports both class-based and value-based dependencies, with autowiring for seamless class injection. Happy coding!

