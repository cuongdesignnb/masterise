import { api } from '@/lib/api';
import { getVisitorId } from './utmService';

/**
 * Public helper to log visitor interaction events (clicks, page views) to the backend.
 * Gracefully logs errors to console to prevent user interaction breaks.
 */
export async function trackEvent(
  eventName: string,
  payload: {
    project_id?: number | null;
    metadata?: Record<string, any>;
    [key: string]: any;
  } = {}
) {
  if (typeof window === 'undefined') return;

  const visitorId = getVisitorId();
  const projectId = payload.project_id || null;

  // Extract metadata excluding project_id
  const { project_id, metadata, ...restPayload } = payload;
  const eventMetadata = {
    ...metadata,
    ...restPayload,
    userAgent: navigator.userAgent,
    path: window.location.pathname,
  };

  try {
    await api.post('/lead-events', {
      visitor_id: visitorId,
      event_name: eventName,
      project_id: projectId,
      metadata: eventMetadata,
    });
  } catch (error) {
    console.warn(`[Tracking] Failed to track event "${eventName}":`, error);
  }
}
