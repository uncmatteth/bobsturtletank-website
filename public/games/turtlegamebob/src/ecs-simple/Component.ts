/**
 * Simple Component base class without decorators
 */

export abstract class Component {
  // Entity this component is attached to
  public entityId: number = -1;
  
  // Type identifier for this component
  public static readonly type: string = '';
  
  constructor() {}
  
  // Get the component type
  public static getType(): string {
    return this.type;
  }
}

// Component registry
export const ComponentRegistry: Record<string, typeof Component> = {};





