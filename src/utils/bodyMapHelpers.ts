import { BODY_HIERARCHY } from '../components/intake/BodyMapHierarchy';
import { StructuredBodyRegion } from '../types/mednova';

export const formatStructuredRegions = (regions?: StructuredBodyRegion[]): string => {
  if (!regions || regions.length === 0) return '';
  
  return regions.map(sel => {
    const region = BODY_HIERARCHY.find(r => r.id === sel.bodyRegion);
    const parts = [];
    
    if (sel.side) {
      parts.push(sel.side.charAt(0).toUpperCase() + sel.side.slice(1));
    }
    
    if (region) {
      if (!sel.subRegion) {
         parts.push(region.label);
      } else {
         const subRegion = region.subRegions?.find(s => s.id === sel.subRegion);
         if (subRegion) {
            parts.push(subRegion.label);
            
            if (sel.specificRegion && subRegion.specificRegions) {
               const specific = subRegion.specificRegions.find(s => s.id === sel.specificRegion);
               if (specific) {
                 parts.push('→ ' + specific.label);
               }
            }
         }
      }
    }
    return parts.join(' ');
  }).join(', ');
};
