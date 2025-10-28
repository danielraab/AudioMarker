-- Insert default Impressum page
INSERT INTO "LegalInformation" ("id", "enabled", "label", "content", "createdAt", "updatedAt", "updatedById")
VALUES (
    'default_impressum_' || lower(hex(randomblob(16))),
    1,
    'Impressum',
    '<h2>Information according to § 5 TMG</h2>
<p><strong>[Your Company Name]</strong><br>
[Your Name]<br>
[Street Address]<br>
[Postal Code] [City]<br>
[Country]</p>

<h2>Contact</h2>
<p>Phone: [Your Phone Number]<br>
Email: [Your Email Address]<br>
Website: [Your Website]</p>

<h2>Responsible for content according to § 55 Abs. 2 RStV</h2>
<p>[Your Name]<br>
[Street Address]<br>
[Postal Code] [City]</p>

<h2>Disclaimer</h2>
<h3>Liability for Contents</h3>
<p>As service providers, we are liable for own contents of these websites according to Paragraph 7, Sect. 1 German Telemedia Act (TMG). However, according to Paragraphs 8 to 10 German Telemedia Act (TMG), service providers are not obligated to permanently monitor submitted or stored information or to search for evidences that indicate illegal activities.</p>

<h3>Liability for Links</h3>
<p>Our offer includes links to external third party websites. We have no influence on the contents of those websites, therefore we cannot guarantee for those contents. Providers or administrators of linked websites are always responsible for their own contents.</p>

<h3>Copyright</h3>
<p>The contents and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution, or any form of commercialization of such material beyond the scope of the copyright law shall require the prior written consent of its respective author or creator.</p>',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    NULL
);
