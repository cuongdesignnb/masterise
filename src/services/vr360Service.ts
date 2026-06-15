import { api } from '@/lib/api';
import { VrTourData, ProjectVrTour, ProjectVrScene, ProjectVrHotspot } from '@/types/vr360';

export const vr360Service = {
  // Public APIs
  getProjectVrTour: async (slug: string) => {
    return api.get<VrTourData>(`/projects/${slug}/vr-tour`);
  },

  // Admin API - get tour with all details (scenes & hotspots)
  getAdminProjectVrTour: async (projectId: number) => {
    return api.get<VrTourData>(`/admin/projects/${projectId}/vr-tour`);
  },

  // Admin API - Create/Update Tour
  saveAdminProjectVrTour: async (projectId: number, data: { title: string; description?: string; cover_image?: string; is_active?: boolean }) => {
    return api.post<ProjectVrTour>(`/admin/projects/${projectId}/vr-tour`, data);
  },

  // Admin API - Add Scene
  addAdminScene: async (tourId: number, data: { title: string; slug: string; panorama_url: string; thumbnail_url?: string; scene_type?: string }) => {
    return api.post<ProjectVrScene>(`/admin/vr-tours/${tourId}/scenes`, data);
  },

  // Admin API - Update Scene
  updateAdminScene: async (sceneId: number, data: Partial<ProjectVrScene>) => {
    return api.patch<ProjectVrScene>(`/admin/vr-scenes/${sceneId}`, data);
  },

  // Admin API - Delete Scene
  deleteAdminScene: async (sceneId: number) => {
    return api.delete<void>(`/admin/vr-scenes/${sceneId}`);
  },

  // Admin API - Add Hotspot
  addAdminHotspot: async (sceneId: number, data: Omit<ProjectVrHotspot, 'id' | 'scene_id'>) => {
    return api.post<ProjectVrHotspot>(`/admin/vr-scenes/${sceneId}/hotspots`, data);
  },

  // Admin API - Update Hotspot
  updateAdminHotspot: async (hotspotId: number, data: Partial<ProjectVrHotspot>) => {
    return api.patch<ProjectVrHotspot>(`/admin/vr-hotspots/${hotspotId}`, data);
  },

  // Admin API - Delete Hotspot
  deleteAdminHotspot: async (hotspotId: number) => {
    return api.delete<void>(`/admin/vr-hotspots/${hotspotId}`);
  },
};
