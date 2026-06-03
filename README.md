# BP's Lawn Care

Static website project for BP's Lawn Care.

## Lead Capture

The contact form works in static-hosting mode:

- The live form is configured to POST to `/api/lead`.
- `/api/lead` sends Brody a lead notification email through Resend.
- If `data-contact-endpoint` on `<body>` is empty, the form opens a prefilled email to `hello@bpslawncare.com`.
- Local lead storage is disabled by default because lead forms collect personally identifiable information. For development-only smoke testing, set `data-local-lead-storage="true"` on `<body>`.

Required production environment variables:

```txt
RESEND_API_KEY=...
LEAD_EMAIL_TO=brody@example.com
LEAD_EMAIL_FROM=BP's Lawn Care <leads@your-verified-domain.com>
```

Before launch, replace the placeholder phone/email and set Brody's real email in `LEAD_EMAIL_TO`. `LEAD_EMAIL_FROM` must use a sender domain verified in Resend.

## Security Notes

- The page includes a restrictive Content Security Policy for a static site.
- Browser form submissions are limited to the same-origin `/api/lead` endpoint by default.
- Brody's destination email is kept server-side in environment variables instead of exposed in browser code.
- Do not enable local lead storage in production.
