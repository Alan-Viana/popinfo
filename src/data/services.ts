export interface ServiceLocation {
  id: string;
  name: string;
  type: 'CAPS' | 'CRAS' | 'CREAS' | 'C.A / CTA' | 'Saúde' | 'Alimentação' | 'Trabalho' | 'Outro';
  address: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  hours: string;
  description: string;
  services_offered: string[];
}

export const servicesData: ServiceLocation[] = [];
