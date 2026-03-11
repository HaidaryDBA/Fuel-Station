import apiClient from '@/lib/api';

import type {
  PaginatedPartnersResponse,
  Partner,
  PartnerFormValues,
  PartnerListParams,
} from '../types/partner';

const PARTNERS_ENDPOINT = '/employees/partners/';

export const partnerService = {
  getPartners: (params?: PartnerListParams) =>
    apiClient.get<PaginatedPartnersResponse>(PARTNERS_ENDPOINT, { params }),

  getPartner: (id: number) => apiClient.get<Partner>(`${PARTNERS_ENDPOINT}${id}/`),

  createPartner: (payload: PartnerFormValues) =>
    apiClient.post<Partner>(PARTNERS_ENDPOINT, payload),

  updatePartner: (id: number, payload: PartnerFormValues) =>
    apiClient.patch<Partner>(`${PARTNERS_ENDPOINT}${id}/`, payload),

  deletePartner: (id: number) => apiClient.delete(`${PARTNERS_ENDPOINT}${id}/`),
};

export default partnerService;
