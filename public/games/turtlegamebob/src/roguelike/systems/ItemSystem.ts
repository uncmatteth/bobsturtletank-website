/**
 * ItemSystem - Handles item usage and effects
 */

import { EventBus } from '../events/EventBus';
import { Entity } from '../entities/Entity';
import { Item } from '../items/Item';

export class ItemSystem {
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
  public useItem(user: Entity, item: Item): boolean {
    return item.use(user);
  }
}
