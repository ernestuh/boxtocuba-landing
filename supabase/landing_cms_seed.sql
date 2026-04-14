-- Landing CMS: seed 25 settings for multilingual landing page content
-- Run this in the Supabase SQL Editor

-- English sections
INSERT INTO settings (key, value, description) VALUES
('LANDING_EN_META', $${
  "title": "Send Packages from Canada to Cuba",
  "description": "Fast, reliable and affordable parcel shipping from Canada to all Cuban provinces. Weekly flights. Real-time tracking."
}$$, 'Landing page EN - meta tags'),

('LANDING_EN_HERO', $${
  "badge": "✈️ Weekly flights to Cuba",
  "headline": "Send love from Canada to Cuba",
  "subtitle": "Fast, reliable, and affordable parcel shipping from Canada to all Cuban provinces. Trusted by families since 2020.",
  "cta_primary": "Get a free quote →",
  "cta_secondary": "How it works",
  "trust_1": "🇨🇦 All Canadian provinces",
  "trust_2": "📦 500+ families served",
  "trust_3": "⭐ 5-star service"
}$$, 'Landing page EN - hero section'),

('LANDING_EN_CUBA_BANNER', $${
  "title": "Delivering love across all of Cuba",
  "subtitle": "From La Habana to Guantánamo — we cover every province.",
  "stat_1_num": "16",
  "stat_1_label": "Cuban provinces",
  "stat_2_num": "500+",
  "stat_2_label": "Families served",
  "stat_3_num": "7–20",
  "stat_3_label": "Business days",
  "stat_4_num": "5★",
  "stat_4_label": "Customer rating"
}$$, 'Landing page EN - Cuba banner stats'),

('LANDING_EN_FEATURES', $${
  "label": "Why choose us",
  "title": "Everything your family needs",
  "subtitle": "We make shipping to Cuba simple, safe, and affordable — from any province in Canada.",
  "cards": [
    { "icon": "🔒", "title": "Safe & Secure", "desc": "Every package is handled with care and fully tracked from pickup to delivery." },
    { "icon": "📍", "title": "Real-time Tracking", "desc": "Follow your shipment every step of the way through our client portal." },
    { "icon": "🇨🇦", "title": "All Canadian Provinces", "desc": "We pick up from Ontario, Quebec, BC, Alberta and more." },
    { "icon": "💰", "title": "Affordable Rates", "desc": "Competitive pricing with no hidden fees. Get your quote in seconds." },
    { "icon": "✈️", "title": "Air Freight", "desc": "Fast delivery in 7–20 business days via weekly flights." },
    { "icon": "💬", "title": "24/7 Support", "desc": "Our team is always available via WhatsApp, phone or email." }
  ]
}$$, 'Landing page EN - features section'),

('LANDING_EN_HOW_IT_WORKS', $${
  "label": "Process",
  "title": "Ship in 3 simple steps",
  "subtitle": "Getting your package to Cuba has never been easier.",
  "steps": [
    { "title": "Get a Quote", "desc": "Enter your package details and destination. Get an instant price estimate — no registration needed." },
    { "title": "Drop Off or Schedule Pickup", "desc": "Bring your package to our Toronto or Montreal location, or schedule a pickup at your door." },
    { "title": "Delivered in Cuba", "desc": "Your package is delivered to your family's door. Track every step through our client portal." }
  ]
}$$, 'Landing page EN - how it works section'),

('LANDING_EN_FAQ', $${
  "label": "FAQ",
  "title": "Frequently asked questions",
  "items": [
    { "q": "How long does shipping take?", "a": "Delivery typically takes 7–20 business days depending on the destination province and flight availability. We operate weekly flights to Cuba." },
    { "q": "What items can I send?", "a": "You can send miscellaneous goods, clothing, food, medicine, electronics, and more. Some items are restricted by Cuban customs regulations." },
    { "q": "Is there a weight limit?", "a": "The maximum weight per package is 50kg for miscellaneous items. For generators and batteries, please contact us for specific limits." },
    { "q": "How is the shipping cost calculated?", "a": "Cost is calculated based on the greater of actual weight or volumetric weight, multiplied by the rate for your destination province." },
    { "q": "Can I track my shipment?", "a": "Yes! Once your package is processed, you'll receive a tracking code to follow your shipment through our client portal." },
    { "q": "Do you pick up from my home?", "a": "Yes, we offer pickup service. Contact us via WhatsApp or phone to schedule a pickup at your location." }
  ]
}$$, 'Landing page EN - FAQ section'),

('LANDING_EN_CONTACT', $${
  "label": "Contact us",
  "title": "We're here to help",
  "phone_label": "Phone",
  "email_label": "Email",
  "location_label": "Locations",
  "location_value": "Toronto & Montreal, Canada",
  "whatsapp_label": "WhatsApp"
}$$, 'Landing page EN - contact section'),

('LANDING_EN_FOOTER', $${
  "tagline": "Reliable parcel shipping from Canada to Cuba. Trusted by families since 2020.",
  "quick_links": "Quick Links",
  "contact": "Contact",
  "rights": "© 2026 Box to Cuba. All rights reserved."
}$$, 'Landing page EN - footer'),

-- Spanish sections
('LANDING_ES_META', $${
  "title": "Envía paquetes de Canadá a Cuba",
  "description": "Envío de paquetes rápido, confiable y asequible de Canadá a todas las provincias cubanas. Vuelos semanales. Rastreo en tiempo real."
}$$, 'Landing page ES - meta tags'),

('LANDING_ES_HERO', $${
  "badge": "✈️ Vuelos semanales a Cuba",
  "headline": "Envía amor de Canadá a Cuba",
  "subtitle": "Envío de paquetes rápido, confiable y asequible a todas las provincias de Cuba. Con la confianza de familias desde 2020.",
  "cta_primary": "Cotizar gratis →",
  "cta_secondary": "Cómo funciona",
  "trust_1": "🇨🇦 Todas las provincias canadienses",
  "trust_2": "📦 +500 familias atendidas",
  "trust_3": "⭐ Servicio 5 estrellas"
}$$, 'Landing page ES - hero section'),

('LANDING_ES_CUBA_BANNER', $${
  "title": "Llevando amor a toda Cuba",
  "subtitle": "De La Habana a Guantánamo — cubrimos cada provincia.",
  "stat_1_num": "16",
  "stat_1_label": "Provincias cubanas",
  "stat_2_num": "+500",
  "stat_2_label": "Familias atendidas",
  "stat_3_num": "7–20",
  "stat_3_label": "Días hábiles",
  "stat_4_num": "5★",
  "stat_4_label": "Valoración clientes"
}$$, 'Landing page ES - Cuba banner stats'),

('LANDING_ES_FEATURES', $${
  "label": "Por qué elegirnos",
  "title": "Todo lo que tu familia necesita",
  "subtitle": "Hacemos el envío a Cuba simple, seguro y asequible — desde cualquier provincia de Canadá.",
  "cards": [
    { "icon": "🔒", "title": "Seguro y confiable", "desc": "Cada paquete es manejado con cuidado y rastreado desde la recogida hasta la entrega." },
    { "icon": "📍", "title": "Rastreo en tiempo real", "desc": "Sigue tu envío en cada paso a través de nuestro portal de clientes." },
    { "icon": "🇨🇦", "title": "Todas las provincias de Canadá", "desc": "Recogemos en Ontario, Quebec, BC, Alberta y más." },
    { "icon": "💰", "title": "Tarifas asequibles", "desc": "Precios competitivos sin cargos ocultos. Obtén tu cotización en segundos." },
    { "icon": "✈️", "title": "Carga aérea", "desc": "Entrega rápida en 7–20 días hábiles mediante vuelos semanales." },
    { "icon": "💬", "title": "Soporte 24/7", "desc": "Nuestro equipo siempre disponible por WhatsApp, teléfono o email." }
  ]
}$$, 'Landing page ES - features section'),

('LANDING_ES_HOW_IT_WORKS', $${
  "label": "Proceso",
  "title": "Envía en 3 simples pasos",
  "subtitle": "Enviar tu paquete a Cuba nunca fue tan fácil.",
  "steps": [
    { "title": "Cotiza tu envío", "desc": "Ingresa los detalles de tu paquete y destino. Obtén un precio al instante — sin registro." },
    { "title": "Entrega o recogida a domicilio", "desc": "Trae tu paquete a nuestra ubicación en Toronto o Montreal, o programa una recogida en tu puerta." },
    { "title": "Entregado en Cuba", "desc": "Tu paquete llega a la puerta de tu familia. Rastréalo en todo momento desde el portal." }
  ]
}$$, 'Landing page ES - how it works section'),

('LANDING_ES_FAQ', $${
  "label": "FAQ",
  "title": "Preguntas frecuentes",
  "items": [
    { "q": "¿Cuánto tarda el envío?", "a": "La entrega suele tardar 7–20 días hábiles según la provincia de destino y la disponibilidad de vuelos. Operamos vuelos semanales a Cuba." },
    { "q": "¿Qué artículos puedo enviar?", "a": "Puedes enviar artículos varios, ropa, alimentos, medicamentos, electrónicos y más. Algunos artículos están restringidos por la aduana cubana." },
    { "q": "¿Hay límite de peso?", "a": "El peso máximo por paquete es de 50kg para artículos varios. Para generadores y baterías, contáctanos para límites específicos." },
    { "q": "¿Cómo se calcula el costo?", "a": "El costo se calcula según el mayor entre el peso real y el peso volumétrico, multiplicado por la tarifa de la provincia de destino." },
    { "q": "¿Puedo rastrear mi envío?", "a": "¡Sí! Una vez procesado tu paquete, recibirás un código de rastreo para seguirlo en tiempo real desde el portal." },
    { "q": "¿Hacen recogida a domicilio?", "a": "Sí, ofrecemos servicio de recogida. Contáctanos por WhatsApp o teléfono para programar una recogida en tu ubicación." }
  ]
}$$, 'Landing page ES - FAQ section'),

('LANDING_ES_CONTACT', $${
  "label": "Contáctanos",
  "title": "Estamos aquí para ayudarte",
  "phone_label": "Teléfono",
  "email_label": "Correo",
  "location_label": "Ubicaciones",
  "location_value": "Toronto y Montreal, Canadá",
  "whatsapp_label": "WhatsApp"
}$$, 'Landing page ES - contact section'),

('LANDING_ES_FOOTER', $${
  "tagline": "Envío confiable de paquetes de Canadá a Cuba. Con la confianza de familias desde 2020.",
  "quick_links": "Enlaces rápidos",
  "contact": "Contacto",
  "rights": "© 2026 Box to Cuba. Todos los derechos reservados."
}$$, 'Landing page ES - footer'),

-- French sections
('LANDING_FR_META', $${
  "title": "Envoyer des colis du Canada à Cuba",
  "description": "Expédition de colis rapide, fiable et abordable du Canada vers toutes les provinces cubaines. Vols hebdomadaires. Suivi en temps réel."
}$$, 'Landing page FR - meta tags'),

('LANDING_FR_HERO', $${
  "badge": "✈️ Vols hebdomadaires vers Cuba",
  "headline": "Envoyez de l'amour du Canada à Cuba",
  "subtitle": "Expédition rapide, fiable et abordable du Canada vers toutes les provinces cubaines. La confiance des familles depuis 2020.",
  "cta_primary": "Devis gratuit →",
  "cta_secondary": "Comment ça marche",
  "trust_1": "🇨🇦 Toutes les provinces canadiennes",
  "trust_2": "📦 +500 familles servies",
  "trust_3": "⭐ Service 5 étoiles"
}$$, 'Landing page FR - hero section'),

('LANDING_FR_CUBA_BANNER', $${
  "title": "Livraison dans tout Cuba",
  "subtitle": "De La Havane à Guantánamo — nous couvrons chaque province.",
  "stat_1_num": "16",
  "stat_1_label": "Provinces cubaines",
  "stat_2_num": "+500",
  "stat_2_label": "Familles servies",
  "stat_3_num": "7–20",
  "stat_3_label": "Jours ouvrables",
  "stat_4_num": "5★",
  "stat_4_label": "Avis clients"
}$$, 'Landing page FR - Cuba banner stats'),

('LANDING_FR_FEATURES', $${
  "label": "Pourquoi nous choisir",
  "title": "Tout ce dont votre famille a besoin",
  "subtitle": "Nous rendons l'expédition vers Cuba simple, sûre et abordable — depuis n'importe quelle province du Canada.",
  "cards": [
    { "icon": "🔒", "title": "Sûr et sécurisé", "desc": "Chaque colis est manipulé avec soin et entièrement suivi de la collecte à la livraison." },
    { "icon": "📍", "title": "Suivi en temps réel", "desc": "Suivez votre envoi à chaque étape via notre portail client." },
    { "icon": "🇨🇦", "title": "Toutes les provinces", "desc": "Nous collectons en Ontario, Québec, C.-B., Alberta et plus encore." },
    { "icon": "💰", "title": "Tarifs abordables", "desc": "Prix compétitifs sans frais cachés. Obtenez votre devis en quelques secondes." },
    { "icon": "✈️", "title": "Fret aérien", "desc": "Livraison rapide en 7–20 jours ouvrables par vols hebdomadaires." },
    { "icon": "💬", "title": "Support 24/7", "desc": "Notre équipe est toujours disponible par WhatsApp, téléphone ou email." }
  ]
}$$, 'Landing page FR - features section'),

('LANDING_FR_HOW_IT_WORKS', $${
  "label": "Processus",
  "title": "Expédiez en 3 étapes simples",
  "subtitle": "Envoyer votre colis à Cuba n'a jamais été aussi facile.",
  "steps": [
    { "title": "Obtenir un devis", "desc": "Entrez les détails de votre colis et votre destination. Obtenez une estimation instantanée — sans inscription." },
    { "title": "Déposer ou planifier une collecte", "desc": "Apportez votre colis à notre bureau de Toronto ou Montréal, ou planifiez une collecte à domicile." },
    { "title": "Livré à Cuba", "desc": "Votre colis est livré à la porte de votre famille. Suivez chaque étape via le portail." }
  ]
}$$, 'Landing page FR - how it works section'),

('LANDING_FR_FAQ', $${
  "label": "FAQ",
  "title": "Questions fréquentes",
  "items": [
    { "q": "Combien de temps dure l'expédition ?", "a": "La livraison prend généralement 7 à 20 jours ouvrables selon la province de destination et la disponibilité des vols." },
    { "q": "Quels articles puis-je envoyer ?", "a": "Vous pouvez envoyer des articles divers, vêtements, aliments, médicaments, électroniques et plus encore." },
    { "q": "Y a-t-il une limite de poids ?", "a": "Le poids maximum par colis est de 50 kg pour les articles divers. Pour les générateurs, contactez-nous." },
    { "q": "Comment le coût est-il calculé ?", "a": "Le coût est calculé selon le plus grand entre le poids réel et le poids volumétrique, multiplié par le tarif de la province de destination." },
    { "q": "Puis-je suivre mon envoi ?", "a": "Oui ! Une fois votre colis traité, vous recevrez un code de suivi pour le suivre en temps réel." },
    { "q": "Faites-vous des collectes à domicile ?", "a": "Oui, nous offrons un service de collecte. Contactez-nous par WhatsApp ou téléphone pour planifier." }
  ]
}$$, 'Landing page FR - FAQ section'),

('LANDING_FR_CONTACT', $${
  "label": "Contactez-nous",
  "title": "Nous sommes là pour vous aider",
  "phone_label": "Téléphone",
  "email_label": "Email",
  "location_label": "Emplacements",
  "location_value": "Toronto et Montréal, Canada",
  "whatsapp_label": "WhatsApp"
}$$, 'Landing page FR - contact section'),

('LANDING_FR_FOOTER', $${
  "tagline": "Expédition fiable de colis du Canada à Cuba. La confiance des familles depuis 2020.",
  "quick_links": "Liens rapides",
  "contact": "Contact",
  "rights": "© 2026 Box to Cuba. Tous droits réservés."
}$$, 'Landing page FR - footer'),

-- Control flag
('LANDING_PENDING_CHANGES', 'false', 'Whether there are unpublished landing page changes waiting to be deployed')

ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();
