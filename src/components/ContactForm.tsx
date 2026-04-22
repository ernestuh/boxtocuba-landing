import { useState, useEffect, useRef } from 'react';

const TURNSTILE_SITE_KEY = '0x4AAAAAAC-Odju1bXQTSqWO';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

const CANADA_PROVINCES = [
  { code: 'ON', name: 'Ontario' },
  { code: 'QC', name: 'Quebec' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'AB', name: 'Alberta' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland & Labrador' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'other', name: 'Other' },
];

const CANADA_CITIES: Record<string, string[]> = {
  ON: ['Toronto', 'Mississauga', 'Brampton', 'Ottawa', 'Hamilton', 'London', 'Windsor'],
  QC: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke'],
  BC: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria', 'Kelowna'],
  AB: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge'],
  MB: ['Winnipeg', 'Brandon'],
  SK: ['Saskatoon', 'Regina'],
  NS: ['Halifax', 'Sydney'],
  NB: ['Moncton', 'Saint John', 'Fredericton'],
  NL: ["St. John's"],
  PE: ['Charlottetown'],
};

const CUBA_PROVINCES = [
  { slug: 'la-habana', name: 'La Habana' },
  { slug: 'artemisa', name: 'Artemisa' },
  { slug: 'mayabeque', name: 'Mayabeque' },
  { slug: 'pinar-del-rio', name: 'Pinar del Río' },
  { slug: 'isla-de-la-juventud', name: 'Isla de la Juventud' },
  { slug: 'matanzas', name: 'Matanzas' },
  { slug: 'villa-clara', name: 'Villa Clara' },
  { slug: 'cienfuegos', name: 'Cienfuegos' },
  { slug: 'sancti-spiritus', name: 'Sancti Spíritus' },
  { slug: 'ciego-de-avila', name: 'Ciego de Ávila' },
  { slug: 'camaguey', name: 'Camagüey' },
  { slug: 'las-tunas', name: 'Las Tunas' },
  { slug: 'holguin', name: 'Holguín' },
  { slug: 'granma', name: 'Granma' },
  { slug: 'santiago-de-cuba', name: 'Santiago de Cuba' },
  { slug: 'guantanamo', name: 'Guantánamo' },
];

const CUBA_CITIES: Record<string, string[]> = {
  'la-habana': ['Habana Vieja', 'Vedado', 'Miramar', 'Centro Habana', 'Cerro', '10 de Octubre', 'Playa'],
  'artemisa': ['Artemisa', 'Güira de Melena', 'San Antonio de los Baños'],
  'mayabeque': ['San José de las Lajas', 'Güines', 'Bejucal'],
  'pinar-del-rio': ['Pinar del Río', 'Consolación del Sur', 'Viñales'],
  'isla-de-la-juventud': ['Nueva Gerona'],
  'matanzas': ['Matanzas', 'Cárdenas', 'Varadero', 'Colón'],
  'villa-clara': ['Santa Clara', 'Sagua la Grande', 'Caibarién'],
  'cienfuegos': ['Cienfuegos', 'Palmira', 'Rodas'],
  'sancti-spiritus': ['Sancti Spíritus', 'Trinidad', 'Fomento'],
  'ciego-de-avila': ['Ciego de Ávila', 'Morón'],
  'camaguey': ['Camagüey', 'Florida', 'Nuevitas'],
  'las-tunas': ['Las Tunas', 'Puerto Padre'],
  'holguin': ['Holguín', 'Moa', 'Banes', 'Gibara'],
  'granma': ['Bayamo', 'Manzanillo', 'Niquero'],
  'santiago-de-cuba': ['Santiago de Cuba', 'Palma Soriano', 'San Luis'],
  'guantanamo': ['Guantánamo', 'Baracoa'],
};

const LABELS: Record<string, Record<string, string>> = {
  en: {
    name: 'Full name', email: 'Email', phone: 'Phone',
    contact_or: 'Email or phone — at least one required',
    from: '📦 Shipping from', from_province: 'Province', from_city: 'City',
    to: '🇨🇺 Shipping to Cuba', to_province: 'Province', to_city: 'City / Municipality',
    weight: '⚖️ Estimated weight (lbs)',
    weight_note: 'Approximate is fine — we confirm before shipment',
    message: 'Message / details (optional)',
    submit: 'Send message →',
    sending: 'Sending…',
    select_province: 'Select province…',
    select_province_first: 'Select a province first',
    type_city: 'Type your city…',
    success_title: 'Message sent!',
    success_body: "We'll get back to you within a few hours.",
    error: 'Something went wrong. Please try again or contact us on WhatsApp.',
    err_name: 'Name is required',
    err_contact: 'Please provide an email or phone number',
    err_ca_province: 'Select your Canadian province',
    err_ca_city: 'Enter your city',
    err_cu_province: 'Select the Cuban province',
    err_cu_city: 'Enter the city or municipality',
    err_weight: 'Enter an estimated weight',
  },
  es: {
    name: 'Nombre completo', email: 'Correo electrónico', phone: 'Teléfono',
    contact_or: 'Correo o teléfono — al menos uno requerido',
    from: '📦 Envío desde', from_province: 'Provincia', from_city: 'Ciudad',
    to: '🇨🇺 Envío a Cuba', to_province: 'Provincia', to_city: 'Ciudad / Municipio',
    weight: '⚖️ Peso estimado (lbs)',
    weight_note: 'Aproximado está bien — confirmamos antes del envío',
    message: 'Mensaje / detalles (opcional)',
    submit: 'Enviar mensaje →',
    sending: 'Enviando…',
    select_province: 'Selecciona una provincia…',
    select_province_first: 'Primero selecciona una provincia',
    type_city: 'Escribe tu ciudad…',
    success_title: '¡Mensaje enviado!',
    success_body: 'Te responderemos en pocas horas.',
    error: 'Algo salió mal. Intenta de nuevo o contáctanos por WhatsApp.',
    err_name: 'El nombre es obligatorio',
    err_contact: 'Proporciona un correo o teléfono',
    err_ca_province: 'Selecciona tu provincia canadiense',
    err_ca_city: 'Ingresa tu ciudad',
    err_cu_province: 'Selecciona la provincia cubana',
    err_cu_city: 'Ingresa la ciudad o municipio',
    err_weight: 'Ingresa un peso estimado',
  },
  fr: {
    name: 'Nom complet', email: 'Courriel', phone: 'Téléphone',
    contact_or: 'Courriel ou téléphone — au moins un requis',
    from: '📦 Expédition depuis', from_province: 'Province', from_city: 'Ville',
    to: '🇨🇺 Livraison à Cuba', to_province: 'Province', to_city: 'Ville / Municipalité',
    weight: '⚖️ Poids estimé (lbs)',
    weight_note: 'Approximatif est correct — nous confirmons avant l\'envoi',
    message: 'Message / détails (facultatif)',
    submit: 'Envoyer →',
    sending: 'Envoi…',
    select_province: 'Sélectionner une province…',
    select_province_first: 'Sélectionnez d\'abord une province',
    type_city: 'Entrez votre ville…',
    success_title: 'Message envoyé!',
    success_body: 'Nous vous répondrons dans quelques heures.',
    error: 'Une erreur s\'est produite. Réessayez ou contactez-nous sur WhatsApp.',
    err_name: 'Le nom est obligatoire',
    err_contact: 'Fournissez un courriel ou un numéro de téléphone',
    err_ca_province: 'Sélectionnez votre province canadienne',
    err_ca_city: 'Entrez votre ville',
    err_cu_province: 'Sélectionnez la province cubaine',
    err_cu_city: 'Entrez la ville ou la municipalité',
    err_weight: 'Entrez un poids estimé',
  },
};

interface Props {
  lang: 'en' | 'es' | 'fr';
  apiUrl: string;
}

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-colors bg-white';
const selectClass = inputClass;
const labelClass = 'block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1';
const errorClass = 'text-xs text-red-500 mt-1';

export default function ContactForm({ lang, apiUrl }: Props) {
  const l = LABELS[lang] ?? LABELS.en;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [caProvince, setCaProvince] = useState('');
  const [caCity, setCaCity] = useState('');
  const [cuProvince, setCuProvince] = useState('');
  const [cuCity, setCuCity] = useState('');
  const [weight, setWeight] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const existing = document.querySelector('script[src*="turnstile"]');
    const init = () => {
      if (turnstileRef.current && window.turnstile && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
          theme: 'light',
          size: 'normal',
        });
      }
    };
    if (existing) { init(); return; }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.head.appendChild(script);
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = l.err_name;
    if (!email.trim() && !phone.trim()) { e.email = l.err_contact; e.phone = l.err_contact; }
    if (!caProvince) e.caProvince = l.err_ca_province;
    if (!caCity.trim()) e.caCity = l.err_ca_city;
    if (!cuProvince) e.cuProvince = l.err_cu_province;
    if (!cuCity.trim()) e.cuCity = l.err_cu_city;
    if (!weight || Number(weight) <= 0) e.weight = l.err_weight;
    if (!turnstileToken) e.turnstile = 'Please complete the verification';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, caProvince, caCity, cuProvince, cuCity, weight: Number(weight), message, lang, turnstileToken }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="text-5xl">✅</div>
        <div className="text-xl font-bold text-gray-900">{l.success_title}</div>
        <div className="text-gray-500 text-sm">{l.success_body}</div>
      </div>
    );
  }

  const caCities = CANADA_CITIES[caProvince] ?? [];
  const cuCities = CUBA_CITIES[cuProvince] ?? [];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Personal info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className={labelClass}>{l.name} *</label>
          <input className={`${inputClass} ${errors.name ? 'border-red-400' : ''}`} type="text" value={name} onChange={e => setName(e.target.value)} />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>{l.email}</label>
          <input className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`} type="email" value={email} onChange={e => setEmail(e.target.value)} />
          {errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>
        <div>
          <label className={labelClass}>{l.phone}</label>
          <input className={`${inputClass} ${errors.phone && !errors.email ? 'border-red-400' : ''}`} type="tel" placeholder="+1 416…" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>
      {(errors.email || errors.phone) && (
        <p className="text-xs text-gray-400 -mt-3">{l.contact_or}</p>
      )}

      {/* Shipping from */}
      <div>
        <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">{l.from}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{l.from_province} *</label>
            <select className={`${selectClass} ${errors.caProvince ? 'border-red-400' : ''}`}
              value={caProvince}
              onChange={e => { setCaProvince(e.target.value); setCaCity(''); }}>
              <option value="">{l.select_province}</option>
              {CANADA_PROVINCES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
            {errors.caProvince && <p className={errorClass}>{errors.caProvince}</p>}
          </div>
          <div>
            <label className={labelClass}>{l.from_city} *</label>
            <input className={`${inputClass} ${errors.caCity ? 'border-red-400' : ''}`}
              type="text"
              placeholder={caProvince ? l.type_city : l.select_province_first}
              disabled={!caProvince}
              value={caCity}
              onChange={e => setCaCity(e.target.value)} />
            {errors.caCity && <p className={errorClass}>{errors.caCity}</p>}
            {caCities.length > 0 && !caCity && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {caCities.map(c => (
                  <button key={c} type="button"
                    onClick={() => setCaCity(c)}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 transition-colors">
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipping to */}
      <div>
        <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">{l.to}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{l.to_province} *</label>
            <select className={`${selectClass} ${errors.cuProvince ? 'border-red-400' : ''}`}
              value={cuProvince}
              onChange={e => { setCuProvince(e.target.value); setCuCity(''); }}>
              <option value="">{l.select_province}</option>
              {CUBA_PROVINCES.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
            {errors.cuProvince && <p className={errorClass}>{errors.cuProvince}</p>}
          </div>
          <div>
            <label className={labelClass}>{l.to_city} *</label>
            <input className={`${inputClass} ${errors.cuCity ? 'border-red-400' : ''}`}
              type="text"
              placeholder={cuProvince ? l.type_city : l.select_province_first}
              disabled={!cuProvince}
              value={cuCity}
              onChange={e => setCuCity(e.target.value)} />
            {errors.cuCity && <p className={errorClass}>{errors.cuCity}</p>}
            {cuCities.length > 0 && !cuCity && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {cuCities.map(c => (
                  <button key={c} type="button"
                    onClick={() => setCuCity(c)}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 transition-colors">
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weight + message */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>{l.weight} *</label>
          <input className={`${inputClass} ${errors.weight ? 'border-red-400' : ''}`}
            type="number" min="1" max="9999" placeholder="25"
            value={weight} onChange={e => setWeight(e.target.value)} />
          {errors.weight ? <p className={errorClass}>{errors.weight}</p> : <p className="text-xs text-gray-400 mt-1">{l.weight_note}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>{l.message}</label>
          <textarea className={inputClass} rows={3} value={message} onChange={e => setMessage(e.target.value)} />
        </div>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3">{l.error}</p>
      )}

      <div className="flex flex-col items-start gap-1">
        <div ref={turnstileRef} />
        {errors.turnstile && <p className="text-xs text-red-500">{errors.turnstile}</p>}
      </div>

      <button type="submit" disabled={status === 'loading' || !turnstileToken}
        className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors text-sm">
        {status === 'loading' ? l.sending : l.submit}
      </button>
    </form>
  );
}
