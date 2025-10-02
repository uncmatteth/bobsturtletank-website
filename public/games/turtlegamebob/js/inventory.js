// ============================================================================
// INVENTORY SYSTEM
// Items, equipment (Phase 4 - stub for now)
// ============================================================================

const Inventory = {
    slots: 8,
    items: [],
    
    addItem(item) {
        if (this.items.length >= this.slots) {
            console.log('Inventory full!');
            return false;
        }
        this.items.push(item);
        return true;
    },
    
    removeItem(index) {
        return this.items.splice(index, 1)[0];
    }
};

