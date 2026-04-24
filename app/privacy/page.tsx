import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal-page";

const effectiveDate = "April 22, 2026";
const lastUpdated = "April 22, 2026";

const privacySections: LegalSection[] = [
  {
    id: "scope",
    title: "1. Scope and Website Owner",
    paragraphs: [
      "This Privacy Policy explains how Shreyas J, located in Karnataka, India, collects, uses, stores, and protects information when you visit or interact with shreyas.cloud, including the homepage, blog pages, contact form, project links, and related public website features.",
      "This policy applies to information processed through the website itself. It does not control third-party services, websites, or social platforms that may be linked from the portfolio. Those services operate under their own privacy notices and terms.",
    ],
  },
  {
    id: "information-collected",
    title: "2. Information Collected",
    paragraphs: [
      "The site is designed to collect only the information reasonably needed to operate the website, publish content, respond to inquiries, and support interactive features.",
    ],
    bullets: [
      "Contact form details you choose to provide, including your name, email address, and message content when you submit an inquiry.",
      "Technical and request information that may be generated automatically when you access the site, such as IP address, browser type, device information, approximate geolocation, timestamps, referring pages, and network or security logs collected by hosting or infrastructure providers.",
      "Website interaction data related to public features, such as anonymous like activity on blog posts, session identifiers used to reduce duplicate likes, and feature-specific usage events needed to keep certain interactive components working correctly.",
      "Browser storage data used for functionality, including a locally stored blog session identifier and a locally stored best-score value for the custom 404 game experience.",
      "Follow-up correspondence or collaboration details if you continue a conversation after using the contact form or another publicly listed communication channel.",
    ],
  },
  {
    id: "how-information-is-used",
    title: "3. How Information Is Used",
    bullets: [
      "To receive, route, review, and respond to contact form inquiries, project requests, and general communication.",
      "To operate the site, deliver portfolio and blog content, maintain uptime, and keep the website secure.",
      "To support public interactive features such as blog likes, session integrity, and saved browser-side preferences or scores.",
      "To monitor abuse, spam, malicious traffic, unauthorized access attempts, and other behavior that could affect the site or its visitors.",
      "To troubleshoot bugs, improve performance, refine user experience, and understand which parts of the site are being used.",
      "To keep reasonable business or communication records related to portfolio inquiries, collaborations, and website administration.",
      "To comply with legal obligations, resolve disputes, and enforce website policies where required.",
    ],
  },
  {
    id: "cookies-storage",
    title: "4. Cookies and Local Storage",
    paragraphs: [
      "The website may rely on essential cookies or similar technologies supplied by its hosting, security, or form-processing providers in order to deliver pages, secure requests, reduce abuse, or process form submissions.",
      "In addition to cookies, the site currently uses browser local storage for limited functional purposes. This includes storing an anonymous blog session identifier and saving a best-score value for the custom not-found page game.",
      "The site uses Umami, a privacy-friendly, cookie-free analytics service, to collect anonymous page view and visitor statistics. Umami does not use cookies or track personal information. The site also uses Vercel Analytics and Vercel Speed Insights for traffic and performance monitoring. These services collect anonymous, aggregated data and do not use advertising cookies or behavioral profiling.",
    ],
    bullets: [
      "You can manage cookies through your browser settings, including blocking or deleting them.",
      "You can clear local storage from your browser if you no longer want feature-related values saved on your device.",
      "If you disable cookies or browser storage, some interactive features may not work as intended.",
    ],
  },
  {
    id: "third-party-services",
    title: "5. Third-Party Services and Processors",
    paragraphs: [
      "The site uses selected third-party services to operate reliably. Those providers may process data on behalf of the website owner according to their own legal terms, technical documentation, and privacy practices.",
    ],
    bullets: [
      "Hosting and delivery infrastructure may process request logs, IP data, and technical metadata for hosting, security, caching, and availability purposes.",
      "Supabase may process database-backed website information such as blog content, public like data, skill-related content, and other app data required by live site features.",
      "Umami Analytics is used to collect anonymous, cookie-free page view and visitor statistics. Umami does not track personal information, does not use cookies, and is fully GDPR-compliant.",
      "Vercel Analytics and Vercel Speed Insights are used to monitor page views, traffic patterns, and Core Web Vitals performance metrics. These services collect anonymous, aggregated data.",
      "Outbound links to platforms such as GitHub, LinkedIn, YouTube, X, and other third-party destinations are controlled by those platforms once you leave the site.",
    ],
  },
  {
    id: "retention",
    title: "6. Data Retention",
    paragraphs: [
      "Personal information is retained only for as long as reasonably necessary to operate the website, respond to inquiries, maintain records, or meet legal and security obligations.",
    ],
    bullets: [
      "Contact inquiries may be retained for up to 24 months after the last meaningful interaction, or longer where needed for an ongoing collaboration, dispute, security review, or legal obligation.",
      "Anonymous feature data, such as blog like records or session-linked entries, may be retained as long as needed to preserve the integrity and continuity of those features.",
      "Browser local storage remains on your device until you clear it, your browser removes it, or the feature no longer uses it.",
      "Hosting, security, and provider logs are retained according to the relevant provider's operational practices and retention policies.",
    ],
  },
  {
    id: "international-transfers",
    title: "7. International Transfers",
    paragraphs: [
      "Because the site may rely on globally distributed infrastructure and service providers, information may be processed or stored outside India, including in jurisdictions where data protection rules differ from those in Karnataka or the rest of India.",
      "By using the website and submitting information through it, you acknowledge that such transfers may occur where necessary to host, secure, and operate the site.",
    ],
  },
  {
    id: "rights-choices",
    title: "8. Your Rights and Choices",
    paragraphs: [
      "Depending on applicable law, you may have rights relating to access, correction, deletion, objection, withdrawal of consent, or restriction of certain processing activities.",
    ],
    bullets: [
      "You may request access to personal information submitted through the contact form.",
      "You may request correction or deletion of contact information or inquiry records, subject to reasonable verification and any legal or security limits.",
      "You may choose not to submit personal information through the contact form at all.",
      "You may control cookies and browser storage through your device or browser settings.",
      "The website does not sell personal information for money and does not currently use ad-tech profiling for targeted advertising.",
    ],
  },
  {
    id: "security",
    title: "9. Security",
    paragraphs: [
      "Reasonable technical and organizational steps are taken to reduce the risk of unauthorized access, misuse, alteration, or loss of information. However, no website, network, or digital transmission method can be guaranteed to be fully secure.",
      "You should avoid sending highly sensitive information, passwords, financial details, government identifiers, or confidential business data through the public contact form unless specifically requested through a secure and appropriate channel.",
    ],
  },
  {
    id: "children",
    title: "10. Children's Privacy",
    paragraphs: [
      "The site is not directed to children under the age of 13 and is not intended to knowingly collect personal information from young children through the contact form or other website features.",
      "If you believe a child has submitted personal information through the website, a deletion request can be made through the contact route described below.",
    ],
  },
  {
    id: "changes",
    title: "11. Changes to This Privacy Policy",
    paragraphs: [
      "This Privacy Policy may be revised from time to time to reflect changes in site features, legal obligations, operational practices, or service providers. When updates are made, the Last Updated date on this page will be revised accordingly.",
      "Continued use of the site after a material update means you acknowledge the updated policy as it applies from the revised effective date.",
    ],
  },
  {
    id: "contact",
    title: "12. Privacy Contact",
    paragraphs: [
      "For privacy-related questions, access or deletion requests, or concerns about how information is handled on this website, you may contact Shreyas J through the contact section on the homepage.",
      "Website owner and controller contact point: Shreyas J, Karnataka, India. Website: shreyas.cloud.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for shreyas.cloud explaining how Shreyas J in Karnataka, India handles contact form submissions, cookies, browser storage, and website data.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "Privacy Policy for shreyas.cloud covering website data practices, cookies, local storage, contact submissions, and third-party processors.",
    url: "/privacy",
    type: "article",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      canonicalPath="/privacy"
      badge="Website Policy"
      title="Privacy Policy"
      description="This Privacy Policy explains how Shreyas J, based in Karnataka, India, handles personal information, website data, contact form submissions, cookies, local storage, and related processing on shreyas.cloud."
      effectiveDate={effectiveDate}
      lastUpdated={lastUpdated}
      facts={[
        { label: "Owner", value: "Shreyas J" },
        { label: "Location", value: "Karnataka, India" },
        { label: "Applies to", value: "shreyas.cloud and its public pages" },
        { label: "Primary channels", value: "Portfolio pages, blog features, and contact form submissions" },
      ]}
      sections={privacySections}
      contactCardTitle="Privacy requests and questions"
      contactCardDescription="If you want to ask about this policy, request deletion of a contact submission, or raise a privacy concern, use the homepage contact section. Please include enough detail for the request to be verified and handled properly."
    />
  );
}
