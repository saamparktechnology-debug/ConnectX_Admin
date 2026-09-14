import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "ConnectX Terms & Conditions governing the use of our dating and social-discovery platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `Welcome to ConnectX ("ConnectX", "we", "us", or "our"). ConnectX is a dating and social-discovery platform that enables users to create profiles, discover other users, communicate, and potentially develop personal or romantic relationships.

By downloading, accessing, registering for, or using ConnectX, you confirm that you have read, understood, and agreed to these Terms & Conditions ("Terms").

If you do not agree with these Terms, you must not use ConnectX.`,
  },
  {
    title: "2. Eligibility",
    content: `1. You must be at least 18 years old to use ConnectX.
2. You must have the legal capacity to enter into these Terms under applicable law.
3. You must provide truthful and accurate registration information.
4. You must not use ConnectX if you are prohibited from using such services under applicable law.
5. We may request age, identity, gender, or other verification information where necessary for safety, security, fraud prevention, or legal compliance.`,
  },
  {
    title: "3. Account Registration",
    content: `You may be required to provide information such as:

• Name or display name
• Date of birth/age
• Gender
• Mobile number or email address
• Profile photograph
• Location or approximate location
• Interests, hobbies, and preferences

You are responsible for ensuring that your information remains accurate and up to date.

You must not:

• Create an account using another person's identity.
• Create multiple accounts to evade restrictions.
• Impersonate another person.
• Provide false age or identity information.
• Use another person's login credentials.
• Sell, transfer, or give your account to another person.

You are responsible for maintaining the confidentiality of your account and login credentials.`,
  },
  {
    title: "4. Profile and Verification",
    content: `ConnectX may offer identity, age, gender, photograph, or other verification features.

Verification does not constitute a guarantee that a person is genuine, safe, trustworthy, or suitable for dating.

Users must not attempt to manipulate, bypass, or misuse ConnectX's verification systems.

If we reasonably believe that an account contains false, misleading, fraudulent, or deceptive information, we may restrict, suspend, or terminate that account.`,
  },
  {
    title: "5. Dating and User Interactions",
    content: `ConnectX facilitates introductions and communication between users. We do not guarantee that users will find a match, relationship, friendship, marriage partner, or any particular outcome.

Users communicate with each other at their own discretion and risk.

You should never share sensitive information such as:

• Passwords
• OTPs
• Banking information
• Credit/debit card details
• UPI PINs
• Government identification numbers
• Private financial information

with another user.

Never send money to someone you meet through ConnectX without independently verifying their identity and circumstances.`,
  },
  {
    title: "6. User Safety",
    content: `Your safety is important to us. Users should exercise reasonable caution when communicating or meeting another person.

For an initial meeting, we recommend:

• Meeting in a public place.
• Informing a trusted person about your plans.
• Using your own transportation.
• Avoiding isolated locations.
• Not sharing unnecessary personal information.
• Leaving immediately if you feel unsafe.

ConnectX is not responsible for the conduct, statements, actions, or behaviour of individual users.

If you believe another user presents an immediate danger, contact the appropriate emergency services or law-enforcement authority.`,
  },
  {
    title: "7. Prohibited Activities",
    content: `You must not use ConnectX to:

1. Harass, threaten, stalk, intimidate, or abuse another person.
2. Engage in hate speech or discriminatory conduct.
3. Impersonate another person.
4. Operate fake, deceptive, or fraudulent profiles.
5. Commit or facilitate scams or financial fraud.
6. Request money or financial assistance through deceptive means.
7. Promote illegal activities.
8. Share malware, viruses, or harmful software.
9. Attempt to hack or compromise ConnectX.
10. Collect another user's personal information without authorization.
11. Use automated bots, scrapers, or unauthorized software.
12. Circumvent account bans or security controls.
13. Engage in sexual exploitation or abuse.
14. Share sexual content involving minors.
15. Facilitate human trafficking or exploitation.
16. Promote prostitution or unlawful sexual services.
17. Publish content that violates applicable law.
18. Use ConnectX for unauthorized commercial solicitation or spam.
19. Upload content that infringes another person's intellectual-property rights.
20. Use ConnectX in a manner that could harm the safety, security, or reputation of other users or the platform.`,
  },
  {
    title: "8. Content Standards",
    content: `You are responsible for the content you upload, post, send, or otherwise make available through ConnectX ("User Content").

User Content must not be unlawful, fraudulent, threatening, abusive, defamatory, obscene, excessively sexually explicit, discriminatory, or otherwise prohibited by these Terms or applicable law.

We may remove or restrict content that violates these Terms or applicable law.`,
  },
  {
    title: "9. Photos and Profile Information",
    content: `You should only upload photographs that:

• You have the right to use.
• Represent you accurately.
• Do not impersonate another person.
• Do not contain unlawful or prohibited material.

You must not upload another person's private photograph or personal information without appropriate permission.`,
  },
  {
    title: "10. Messaging",
    content: `ConnectX may provide private or other communication features.

You agree not to use messaging features for:

• Spam
• Fraud
• Harassment
• Threats
• Unwanted sexual content
• Extortion
• Financial scams
• Malicious links
• Illegal activities

Users may block or report other users.

ConnectX may review or process communications where reasonably necessary for safety, abuse prevention, security, fraud detection, legal compliance, or enforcement of these Terms, subject to applicable law and our Privacy Policy.`,
  },
  {
    title: "11. Reporting and Blocking",
    content: `Users can report or block accounts that they believe violate these Terms.

When you submit a report, you should provide accurate information.

We may investigate reported accounts and may take actions including:

• Warning the user
• Removing content
• Limiting account functionality
• Suspending an account
• Permanently terminating an account
• Reporting serious matters to appropriate authorities where required or permitted by law`,
  },
  {
    title: "12. Intellectual Property",
    content: `ConnectX and its associated software, branding, logos, trademarks, designs, text, graphics, interfaces, and other platform materials are owned by or licensed to ConnectX and are protected by applicable intellectual-property laws.

You may not copy, modify, reproduce, distribute, sell, reverse engineer, or commercially exploit ConnectX or its intellectual property without prior written authorization.`,
  },
  {
    title: "13. User Content Licence",
    content: `You retain ownership of the User Content you submit to ConnectX.

By uploading User Content, you grant ConnectX a non-exclusive, worldwide, royalty-free licence to host, store, reproduce, display, transmit, modify where technically necessary, and distribute that content as reasonably required to operate, maintain, improve, promote, and provide the ConnectX service, subject to applicable law and our Privacy Policy.

You represent that you have the necessary rights to provide such content.`,
  },
  {
    title: "14. Privacy and Personal Data",
    content: `Your use of ConnectX is also governed by our Privacy Policy.

We may collect and process information necessary to provide and secure the service, including account information, profile information, device information, usage information, and other information described in the Privacy Policy.

We will process personal information in accordance with applicable Indian law and our published privacy practices.`,
  },
  {
    title: "15. Location Information",
    content: `Certain ConnectX features may use location information to provide matching, discovery, safety, or other services.

You may be able to control location permissions through your device settings. Disabling location access may affect certain features.

ConnectX may use approximate location rather than displaying your exact location to other users, depending on the feature and applicable settings.`,
  },
  {
    title: "16. Premium Features and Subscriptions",
    content: `ConnectX may offer paid features, subscriptions, virtual items, boosts, or other premium services.

Before purchasing, you will be shown applicable pricing and subscription information.

Where a subscription automatically renews, it may continue until cancelled in accordance with the applicable purchase platform's cancellation process.

You are responsible for cancelling subscriptions before the next renewal period if you do not wish to continue.

Payments may be processed by third-party app stores or payment providers. Their terms may also apply.`,
  },
  {
    title: "17. Refunds",
    content: `Refunds are subject to applicable law, the terms of the relevant app store or payment provider, and the specific purchase terms presented at the time of purchase.

Where required by applicable law, eligible refunds will be provided in accordance with those legal requirements.

Deleting your ConnectX account does not automatically guarantee a refund for a previously purchased subscription or service.`,
  },
  {
    title: "18. Third-Party Services",
    content: `ConnectX may integrate with third-party services, including payment processors, authentication services, analytics providers, cloud services, app stores, or other technology providers.

Your use of third-party services may be subject to their separate terms and privacy policies.

ConnectX is not responsible for independent third-party services outside its reasonable control.`,
  },
  {
    title: "19. Account Suspension and Termination",
    content: `We may suspend, restrict, or terminate your account if:

• You violate these Terms.
• You provide false information.
• Your account is involved in fraud or abuse.
• Your activities create a safety or security risk.
• Your conduct violates applicable law.
• We are required to do so by law or lawful authority.
• We reasonably believe termination is necessary to protect users or the platform.

You may stop using ConnectX at any time.

Where appropriate and legally permitted, we may provide notice or an opportunity to appeal an enforcement decision.`,
  },
  {
    title: "20. Appeals",
    content: `If your account is suspended or terminated and you believe the decision was made in error, you may contact ConnectX through the designated support or grievance channel.

Your appeal should include:

• Your registered account information
• Description of the issue
• Reason you believe the decision was incorrect
• Any relevant supporting information

We may review the appeal and determine whether further action is appropriate.`,
  },
  {
    title: "21. Disclaimer",
    content: `ConnectX provides a platform for users to discover and communicate with other users.

We do not guarantee:

• The accuracy of user profiles.
• The identity of any user.
• The safety or character of any user.
• That a user will be genuine or truthful.
• That users will form relationships.
• That the service will always be uninterrupted or error-free.

You are responsible for exercising your own judgment when interacting with other users.`,
  },
  {
    title: "22. Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, ConnectX and its owners, employees, affiliates, service providers, and representatives will not be liable for indirect, incidental, special, consequential, or punitive losses arising from your use of the platform, including losses resulting from interactions with other users.

Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited under applicable law.`,
  },
  {
    title: "23. Indemnification",
    content: `To the extent permitted by applicable law, you agree to indemnify and hold harmless ConnectX and its owners, affiliates, employees, representatives, and service providers from claims, losses, liabilities, damages, costs, or expenses arising from:

• Your violation of these Terms.
• Your unlawful conduct.
• Your User Content.
• Your infringement of another person's rights.
• Your interactions with other users.`,
  },
  {
    title: "24. Changes to These Terms",
    content: `We may update these Terms from time to time.

When material changes are made, we may provide notice through the application, website, email, or another reasonable method.

Your continued use of ConnectX after the effective date of updated Terms constitutes acceptance of the updated Terms, to the extent permitted by applicable law.`,
  },
  {
    title: "25. Changes to the Service",
    content: `We may modify, suspend, discontinue, or introduce features to ConnectX from time to time.

We may also impose reasonable usage limits or restrictions where necessary for security, performance, legal compliance, or platform integrity.`,
  },
  {
    title: "26. Governing Law",
    content: `These Terms shall be governed by the laws of India, subject to applicable consumer-protection and other mandatory legal rights.

Any dispute shall be subject to the jurisdiction of the courts having appropriate jurisdiction under applicable law.`,
  },
  {
    title: "27. Grievance and Contact",
    content: `For questions, complaints, account issues, safety reports, or legal concerns, users may contact ConnectX through the official support/grievance channels provided within the application or on the official ConnectX website.

ConnectX Support Email: connectx24.support@gmail.com
Grievance Officer: PANKAJ TD BULL
Grievance Email: connectx24.in@gmail.com
Registered Office: Debra Bazar, Paschim Medinipur, West Bengal, India
Website: connectx.live`,
  },
  {
    title: "28. Severability",
    content: `If any provision of these Terms is determined to be invalid or unenforceable, the remaining provisions will continue to remain effective to the extent permitted by law.`,
  },
  {
    title: "29. Entire Agreement",
    content: `These Terms, together with the Privacy Policy and any other applicable policies or purchase terms, constitute the agreement between you and ConnectX regarding your use of the service.`,
  },
  {
    title: "30. Contact Us",
    content: `If you have questions regarding these Terms, please contact ConnectX through the official support channels.

Thank you for using ConnectX. Please connect responsibly, respectfully, and safely.`,
  },
];

export default function TermsPage() {
  return (
    <section className="min-h-screen bg-white pt-28 pb-16">
      <div className="container-x mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-pink transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Home
        </Link>

        <h1 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-gray-500">Effective Date: 30 August 2026 &middot; Last Updated: 30 August 2026</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-lg font-semibold text-brand-pink">{section.title}</h2>
              <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
