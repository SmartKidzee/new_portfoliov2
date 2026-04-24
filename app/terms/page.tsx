import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal-page";

const effectiveDate = "April 22, 2026";
const lastUpdated = "April 22, 2026";

const termsSections: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    paragraphs: [
      "These Terms & Conditions govern your access to and use of shreyas.cloud, a personal portfolio and content website owned and operated by Shreyas J from Karnataka, India.",
      "By visiting, browsing, reading, linking to, or using any feature of the website, you agree to comply with these Terms & Conditions and all applicable laws. If you do not agree, you should discontinue use of the site.",
    ],
  },
  {
    id: "website-purpose",
    title: "2. Website Purpose and Access",
    paragraphs: [
      "The website exists to present portfolio work, writing, projects, experiments, public information about Shreyas J, and a contact route for professional or general communication.",
      "Access to the site is provided on a temporary and revocable basis. The site owner may change, suspend, remove, update, or restrict any page, feature, content block, or technical function at any time without prior notice.",
    ],
  },
  {
    id: "permitted-use",
    title: "3. Permitted and Prohibited Use",
    bullets: [
      "You may view, read, and share public pages of the website for lawful personal, educational, editorial, or professional reference purposes.",
      "You may not use the site in a way that is unlawful, abusive, defamatory, fraudulent, malicious, deceptive, or harmful to the site owner, the website infrastructure, or other users.",
      "You may not attempt to gain unauthorized access to any part of the website, its underlying services, connected databases, admin areas, or provider infrastructure.",
      "You may not introduce malware, bots, scrapers, denial-of-service activity, automated spam, prompt injection, or other harmful code or behavior against the site.",
      "You may not misuse the contact form, including by sending spam, harassment, illegal material, misleading information, or unnecessary sensitive personal data.",
      "You may not frame, mirror, copy, systematically reproduce, or commercially exploit substantial portions of the website without prior written permission, except where applicable law clearly allows it.",
    ],
  },
  {
    id: "intellectual-property",
    title: "4. Intellectual Property",
    paragraphs: [
      "Unless otherwise stated, the design, copy, branding, layout, original writing, visual presentation, portfolio descriptions, and original website materials on shreyas.cloud are owned by or licensed to Shreyas J.",
      "Certain project references, platform names, software libraries, trademarks, logos, and external assets may belong to their respective owners and are used only for identification, commentary, or integration purposes.",
    ],
    bullets: [
      "You receive a limited, non-exclusive, non-transferable right to access and view the site for lawful personal or professional reference.",
      "No ownership rights are transferred to you by using the site.",
      "If you want to reuse substantial text, branded visuals, or other original materials from the site beyond fair use or lawful quotation, you should obtain permission first.",
    ],
  },
  {
    id: "submissions",
    title: "5. Contact Form and User Submissions",
    paragraphs: [
      "When you submit information through the contact form or another public website channel, you confirm that the information you provide is accurate to the best of your knowledge and that you have the right to share it.",
      "By sending a message through the site, you authorize Shreyas J and the service providers used to operate the form to process, transmit, store, and review that submission for the purpose of responding, evaluating inquiries, maintaining records, and protecting the site from abuse.",
    ],
    bullets: [
      "Do not submit confidential business information, trade secrets, passwords, government identifiers, payment card data, or emergency requests through the public contact form.",
      "Messages that are unlawful, threatening, abusive, infringing, fraudulent, or technically harmful may be ignored, blocked, reported, or removed without notice.",
      "Submitting a message does not create a partnership, employment relationship, agency relationship, or guaranteed business engagement.",
    ],
  },
  {
    id: "third-party-links",
    title: "6. Third-Party Links and Services",
    paragraphs: [
      "The website may contain links or integrations involving Formspree, Supabase, GitHub, LinkedIn, YouTube, X, and other external tools or destinations.",
      "Those third-party platforms are not controlled by Shreyas J once you leave the site or begin interacting directly with them. Their separate terms, privacy policies, data practices, and technical conditions will apply.",
    ],
  },
  {
    id: "accuracy-availability",
    title: "7. Accuracy, Availability, and No Warranty",
    paragraphs: [
      "The website and all content on it are provided on an \"as is\" and \"as available\" basis. While reasonable care is taken to keep content accurate and the site functional, no guarantee is given that every page, statement, feature, route, link, or integration will always be complete, current, uninterrupted, or error-free.",
      "Website content is shared for general information, portfolio presentation, and public communication purposes only. Nothing on the site constitutes legal advice, financial advice, regulatory advice, professional consulting, or a binding commercial offer unless explicitly stated in a separate written agreement.",
    ],
  },
  {
    id: "liability",
    title: "8. Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by applicable law, Shreyas J will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive loss arising out of or connected with your use of, or inability to use, the website.",
      "This includes, without limitation, loss of data, loss of business, interruption, reputational harm, security incidents, third-party service failures, or reliance on website content, even if the possibility of such issues was foreseeable.",
    ],
  },
  {
    id: "indemnity",
    title: "9. Indemnity",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless Shreyas J from claims, liabilities, damages, losses, and expenses arising from your misuse of the website, your violation of these Terms & Conditions, or your infringement of another person's rights in connection with your use of the site.",
    ],
  },
  {
    id: "privacy",
    title: "10. Privacy and Cookies",
    paragraphs: [
      "Use of the website is also subject to the Privacy Policy, which explains how contact form data, cookies, browser storage, public like activity, and technical website information may be processed.",
      "By continuing to use the site, you acknowledge that the privacy and cookie practices described in the Privacy Policy form part of the overall framework governing your use of the site.",
    ],
  },
  {
    id: "changes",
    title: "11. Changes to These Terms",
    paragraphs: [
      "These Terms & Conditions may be updated from time to time to reflect site changes, business needs, legal developments, or technical updates. When changes are made, the Last Updated date on this page will be revised.",
      "Continued use of the site after updated Terms & Conditions become effective means you accept the revised version then in force.",
    ],
  },
  {
    id: "governing-law",
    title: "12. Governing Law and Jurisdiction",
    paragraphs: [
      "These Terms & Conditions are governed by the laws of India, without regard to conflict-of-law principles that would require a different legal system to apply.",
      "Any dispute arising out of or relating to the website or these Terms & Conditions will be subject to the jurisdiction of the competent courts in Karnataka, India, unless applicable law requires otherwise.",
    ],
  },
  {
    id: "contact",
    title: "13. Contact for Legal Matters",
    paragraphs: [
      "For questions about these Terms & Conditions, permissions, legal notices, or website-related concerns, you may contact Shreyas J through the contact section on the homepage.",
      "Website owner and operator: Shreyas J, Karnataka, India. Website: shreyas.cloud.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms & Conditions for shreyas.cloud setting out acceptable use, intellectual property, contact submissions, privacy, liability, and governing law.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms & Conditions",
    description:
      "Terms & Conditions for shreyas.cloud covering use of the website, content rights, contact form rules, third-party services, and legal limitations.",
    url: "/terms",
    type: "article",
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      canonicalPath="/terms"
      badge="Website Terms"
      title="Terms & Conditions"
      description="These Terms & Conditions govern use of shreyas.cloud, including the portfolio, blog pages, project showcases, public interaction features, and the contact form operated by Shreyas J from Karnataka, India."
      effectiveDate={effectiveDate}
      lastUpdated={lastUpdated}
      facts={[
        { label: "Owner", value: "Shreyas J" },
        { label: "Location", value: "Karnataka, India" },
        { label: "Website", value: "shreyas.cloud" },
        { label: "Governing law", value: "Laws of India, with jurisdiction in Karnataka, India" },
      ]}
      sections={termsSections}
      contactCardTitle="Permissions, legal notices, and questions"
      contactCardDescription="If you need to ask about reuse permissions, a legal concern, or a website-related issue covered by these Terms & Conditions, use the homepage contact section with enough detail to identify the request clearly."
    />
  );
}
