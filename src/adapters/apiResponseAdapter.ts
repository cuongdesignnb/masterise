import { ApiResponse } from '@/types/api';

/**
 * Safely extracts the core data payload from various Laravel API response shapes.
 */
export function unwrapData<T>(response: ApiResponse<T> | any): T {
  if (!response) return response;
  
  // Helper to extract nested single resource keys
  const extractNestedResource = (data: any): any => {
    if (data && typeof data === 'object') {
      if ('data' in data) {
        return extractNestedResource(data.data);
      }
      const keys = Object.keys(data);
      // If there is only one key and it matches a known resource keyword, unwrap it
      const resourceKeys = ['project', 'user', 'lead', 'note', 'developer', 'location', 'activity', 'assignment'];
      if (keys.length === 1 && resourceKeys.includes(keys[0])) {
        return data[keys[0]];
      }
    }
    return data;
  };

  // If it's a standard ApiResponse shape from our lib/api
  if (response.success && response.data !== undefined) {
    return extractNestedResource(response.data);
  }
  
  // General fallback for raw axios/fetch response shapes
  if (response.data !== undefined) {
    return extractNestedResource(response.data);
  }
  
  return response;
}

/**
 * Extracts pagination metadata from the response if present.
 */
export function extractMeta(response: any) {
  if (response && response.meta) {
    return response.meta;
  }
  if (response && response.data && response.data.meta) {
    return response.data.meta;
  }
  return null;
}
