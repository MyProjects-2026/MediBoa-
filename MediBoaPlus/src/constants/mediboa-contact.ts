/**
 * MediBoaPlus official contact configuration.
 * Keep the legacy fields below for compatibility with existing screens.
 */

export const MEDIBOA_CONTACT = {
  region: 'Mozambique',
  address: 'Mozambique',

  // Legacy fields used by the existing Contact Us screen.
  // These point to the medical contact by default.
  phone: '+258874290037',
  whatsapp: '+258874290037',
  email: 'boasilvia@gmail.com',

  // Medical contact
  doctor: {
    title: 'Dra.',
    name: 'Sìlvia Patrícia Boa',
    role: 'Doctor',
    phone: '+258874290037',
    whatsapp: '+258874290037',
    email: 'boasilvia@gmail.com',
  },

  // Administration and technical support
  administrator: {
    title: 'Mr.',
    name: 'Toni Magaie',
    role: 'Information Analyst (Admin)',
    phone: '+258879843287',
    whatsapp: '+258879843287',
    email: 'tonipower@icloud.com',
  },
};

/**
 * Returns the configured WhatsApp/phone number using digits only.
 * This format is suitable for constructing a WhatsApp URL.
 */
export function getConfiguredPhone(): string {
  return (MEDIBOA_CONTACT.whatsapp || MEDIBOA_CONTACT.phone)
    .replace(/\D/g, '');
}
