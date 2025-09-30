/**
 * Component - Base class for all ECS components
 * Components are pure data containers with no behavior
 */

export abstract class Component {
  // Entity this component is attached to
  public entity: number = -1;
  
  // Type identifier for this component
  public static type: string = '';
  
  // Constructor can be extended by child classes
  constructor() {}
  
  // Get the type of this component
  public getType(): string {
    return (this.constructor as any).type;
  }
}

// Component types registry
export const ComponentTypes: Record<string, typeof Component> = {};

// Register a component type
export function registerComponentType(componentClass: typeof Component, type: string): void {
  // Set the type property on the class
  (componentClass as any).type = type;
  
  // Register the component type
  ComponentTypes[type] = componentClass;
}
