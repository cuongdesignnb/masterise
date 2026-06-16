import { api } from '@/lib/api';

export const homepageService = {
  async getHeroBanners() {
    return api.get('/hero-banners');
  },
  async getFaqs() {
    return api.get('/faqs');
  },
  async getTestimonials() {
    return api.get('/testimonials');
  },
  async getPartners() {
    return api.get('/partners');
  },
};
