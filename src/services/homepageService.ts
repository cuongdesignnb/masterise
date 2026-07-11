import { api } from '@/lib/api';

export interface HomepageFaq {
  id: number;
  question: string;
  answer: string;
}

export const homepageService = {
  async getHeroBanners() {
    return api.get('/hero-banners');
  },
  async getFaqs() {
    return api.get<HomepageFaq[]>('/faqs');
  },
  async getTestimonials() {
    return api.get('/testimonials');
  },
  async getPartners() {
    return api.get('/partners');
  },
};
