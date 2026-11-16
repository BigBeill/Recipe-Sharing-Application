// Instance -> the awilix cradle it was constructed with. Nothing is added to the instance itself.
const scopes = new WeakMap<object, { cradle: Record<string, unknown>; className: string }>();

//* Captures the awilix cradle a class is constructed with, so method decorators can resolve their own dependencies
//? Requires awilix PROXY injection mode (the constructor receives the cradle as its first argument)
//? The class's own constructor is untouched: it can take whatever deps it wants, no super() call needed
export function ScopeAware<T extends new (...args: any[]) => object>(value: T, context: ClassDecoratorContext<T>) {
   const className = String(context.name);
   const Wrapped = class extends value {
      constructor(...args: any[]) {
         super(...args);
         scopes.set(this, { cradle: args[0], className });
      }
   };
   Object.defineProperty(Wrapped, "name", { value: className }); // keep the real name in logs / stack traces
   return Wrapped;
}

//* Used inside method decorators to resolve a dependency from the instance's own awilix scope
//? Throws at runtime if the class is missing @ScopeAware, or the dependency isn't registered
export function getScope(instance: object, decoratorName: string) {
   const scope = scopes.get(instance);
   if (!scope) { throw new Error(`@${decoratorName} on ${instance.constructor.name} needs @ScopeAware on the class`); }
   return {
      className: scope.className,
      resolve<D>(name: string): D {
         const dependency = scope.cradle[name];
         if (dependency === undefined) { throw new Error(`@${decoratorName} on ${scope.className} needs "${name}" registered in the container`); }
         return dependency as D;
      },
   };
}