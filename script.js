const yearNode = document.getElementById('year');
if (yearNode) yearNode.textContent = String(new Date().getFullYear());

const business = {
  name: "BP's Lawn Care",
  phone: '+15125551234',
  displayPhone: '(512) 555-1234',
  email: 'hello@bpslawncare.com',
  serviceArea: 'Greater Austin area',
  hours: 'Mon-Fri, 8am-6pm',
};

const root = document.documentElement;
root.style.setProperty('--brand-name', business.name);

const leadStorageKey = 'bpsLawnCareLeads';

function saveLeadLocally(payload) {
  try {
    const existing = JSON.parse(localStorage.getItem(leadStorageKey) || '[]');
    existing.unshift(payload);
    localStorage.setItem(leadStorageKey, JSON.stringify(existing.slice(0, 25)));
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealNodes = document.querySelectorAll('.reveal');

if (!reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealNodes.forEach((node) => io.observe(node));

  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 5}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
    });
  });
} else {
  revealNodes.forEach((node) => node.classList.add('show'));
}

const sizeRates = { small: 45, medium: 60, large: 85 };
const frequencyMultipliers = { weekly: 1, biweekly: 1.25, onetime: 2.2 };
const addonRates = { edging: 5, debris: 18, beds: 15 };

const quoteForm = document.getElementById('quoteTool');
const estimatePrice = document.getElementById('estimatePrice');
const estimateNotes = document.getElementById('estimateNotes');

function updateEstimate() {
  if (!quoteForm || !estimatePrice || !estimateNotes) return;

  const size = quoteForm.elements.size.value;
  const frequency = quoteForm.elements.frequency.value;
  const addons = Array.from(quoteForm.querySelectorAll('input[name="addons"]:checked')).map((node) => node.value);

  let total = Math.round(sizeRates[size] * frequencyMultipliers[frequency]);
  addons.forEach((addon) => {
    total += addonRates[addon] || 0;
  });

  estimatePrice.textContent = `$${total}`;

  const addonLabel = addons.length ? addons.join(', ') : 'no add-ons';
  estimateNotes.textContent = `${size} lawn, ${frequency} service, ${addonLabel}. Coverage: ${business.serviceArea}.`;
}

function openMailto(subject, body) {
  const url = `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}

if (quoteForm) {
  quoteForm.addEventListener('input', updateEstimate);
  updateEstimate();
}

const compareRange = document.getElementById('compareRange');
const afterLayer = document.getElementById('afterLayer');
if (compareRange && afterLayer) {
  compareRange.addEventListener('input', () => {
    const value = Number(compareRange.value);
    afterLayer.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  });
}

const estimateEmailBtn = document.getElementById('estimateEmailBtn');
if (estimateEmailBtn) {
  estimateEmailBtn.addEventListener('click', () => {
    if (!quoteForm || !estimatePrice || !estimateNotes) return;

    const size = quoteForm.elements.size.value;
    const frequency = quoteForm.elements.frequency.value;
    const addons = Array.from(quoteForm.querySelectorAll('input[name="addons"]:checked')).map((node) => node.value);
    const subject = `${business.name} estimate request`;
    const body = [
      'Hello BP team,',
      '',
      `I’d like a quote for a ${size} lawn.`,
      `Service frequency: ${frequency}.`,
      `Add-ons: ${addons.length ? addons.join(', ') : 'none'}.`,
      `Current estimate: ${estimatePrice.textContent}.`,
      `Notes: ${estimateNotes.textContent}.`,
      '',
      'Please reply with the next step.',
    ].join('\n');

    openMailto(subject, body);
  });
}

const availabilityTool = document.getElementById('availabilityTool');
const slotsResult = document.getElementById('slotsResult');

if (availabilityTool && slotsResult) {
  availabilityTool.addEventListener('submit', (event) => {
    event.preventDefault();

    const zip = availabilityTool.elements.zip.value.trim();
    const day = availabilityTool.elements.day.value;

    if (!/^\d{5}$/.test(zip)) {
      slotsResult.innerHTML = '<p class="meta">Next openings</p><ul><li>Please enter a valid 5-digit ZIP code.</li></ul>';
      return;
    }

    const baseHour = (Number(zip.slice(-1)) % 4) + 8;
    const slots = [`${day} ${baseHour}:00 AM`, `${day} ${baseHour + 2}:30 PM`, `Next ${day} ${baseHour + 1}:15 PM`];
    slotsResult.innerHTML = `<p class="meta">Next openings near ${zip}</p><ul>${slots.map((slot) => `<li>${slot}</li>`).join('')}</ul><button class="btn btn-ghost" type="button" id="slotsEmailBtn">Email This Schedule</button>`;

    const slotsEmailBtn = document.getElementById('slotsEmailBtn');
    if (slotsEmailBtn) {
      slotsEmailBtn.addEventListener('click', () => {
        const subject = `${business.name} availability request`;
        const body = [
          'Hello BP team,',
          '',
          `ZIP code: ${zip}`,
          `Preferred day: ${day}`,
          `Suggested openings: ${slots.join(', ')}`,
          '',
          'Please confirm availability and next steps.',
        ].join('\n');
        openMailto(subject, body);
      });
    }
  });
}

const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = contactForm.querySelector('button[type="submit"]');
    if (!button || !contactStatus) return;

    const formData = new FormData(contactForm);
    const fullName = String(formData.get('fullName') || '').trim();
    const emailAddress = String(formData.get('emailAddress') || '').trim();
    const serviceAddress = String(formData.get('serviceAddress') || '').trim();
    const phoneNumber = String(formData.get('phoneNumber') || '').trim();
    const projectNotes = String(formData.get('projectNotes') || '').trim();
    const companyWebsite = String(formData.get('companyWebsite') || '').trim();

    if (!fullName || !emailAddress || !serviceAddress) {
      contactStatus.textContent = 'Please fill out your name, email, and service address.';
      contactStatus.className = 'form-status is-error';
      return;
    }

    if (!isValidEmail(emailAddress)) {
      contactStatus.textContent = 'Please enter a valid email address.';
      contactStatus.className = 'form-status is-error';
      return;
    }

    const endpoint = document.body.dataset.contactEndpoint || '';
    const localLeadStorageEnabled = document.body.dataset.localLeadStorage === 'true';
    button.disabled = true;
    button.textContent = 'Sending...';
    contactStatus.textContent = 'Preparing your request...';
    contactStatus.className = 'form-status';

    const payload = {
      business: business.name,
      fullName,
      emailAddress,
      serviceAddress,
      phoneNumber,
      projectNotes,
      companyWebsite,
      submittedAt: new Date().toISOString(),
    };

    const savedLocally = localLeadStorageEnabled ? saveLeadLocally(payload) : false;

    const complete = (message, isError = false) => {
      button.disabled = false;
      button.textContent = 'Request Quote';
      contactStatus.textContent = message;
      contactStatus.className = `form-status ${isError ? 'is-error' : 'is-success'}`;
    };

    if (!endpoint) {
      openMailto(
        `${business.name} quote request from ${fullName}`,
        [
          'Hello BP team,',
          '',
          `Name: ${fullName}`,
          `Email: ${emailAddress}`,
          `Phone: ${phoneNumber || 'not provided'}`,
          `Service address: ${serviceAddress}`,
          `Project notes: ${projectNotes || 'none'}`,
          '',
          'Please reply with the next step.',
        ].join('\n')
      );
      complete(
        savedLocally
          ? 'Lead saved locally. Opening your email app with a prefilled quote request.'
          : 'Opening your email app with a prefilled quote request. No lead data was stored in this browser.'
      );
      contactForm.reset();
      return;
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Submission failed');
        complete(`Thanks, ${fullName}. Brody has your request and will follow up at ${emailAddress}.`);
        contactForm.reset();
      })
      .catch(() => {
        complete('We could not send this request. Please try again or contact us by phone.', true);
      });
  });
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: business.name,
  telephone: business.phone,
  email: business.email,
  areaServed: business.serviceArea,
  openingHours: business.hours,
  description: 'Weekly mowing, cleanup, edging, and curb appeal refresh services.',
};

const jsonLd = document.createElement('script');
jsonLd.type = 'application/ld+json';
jsonLd.textContent = JSON.stringify(structuredData);
document.head.appendChild(jsonLd);
