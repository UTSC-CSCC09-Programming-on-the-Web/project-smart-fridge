import { FridgeService } from '../services/fridge.service';

export function getFridgeIdOrFallback(fridgeService: FridgeService): string | null {
    const fridge_id = fridgeService.getCurrentFridgeId();
    if (!fridge_id) {
        console.error('[getFridgeIdOrFallback] Fridge ID is not available');
    }
    return fridge_id;
}
