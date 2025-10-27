import { type Metadata } from "next";
import { env } from "~/env";

export const metadata: Metadata = {
  title: "Terms of Service - Audio Marker",
  description: "Terms of Service for Audio Marker application",
};

export default function TermsOfService() {
  const contactEmail = (env.CONTACT_EMAIL) as string;
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Terms of Service</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Last updated: October 27, 2025
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Audio Marker ("the Service"), you accept and
          agree to be bound by these Terms of Service ("Terms"). If you do not
          agree to these Terms, please do not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Audio Marker is a web application that allows users to upload, store,
          annotate, and organize audio files with time-based markers and
          playlists. The Service includes both private and public sharing
          features.
        </p>

        <h2>3. User Accounts</h2>
        <h3>3.1 Account Creation</h3>
        <ul>
          <li>You must provide accurate and complete information</li>
          <li>You are responsible for maintaining account security</li>
          <li>You must be at least 13 years of age to use this Service</li>
          <li>One person or entity may maintain only one account</li>
        </ul>

        <h3>3.2 Account Responsibilities</h3>
        <ul>
          <li>
            You are responsible for all activities under your account
          </li>
          <li>
            Notify us immediately of any unauthorized access
          </li>
          <li>
            You may not share your account credentials with others
          </li>
        </ul>

        <h2>4. User Content and Copyright</h2>
        <h3>4.1 Your Content</h3>
        <p>
          You retain all ownership rights to the audio files and content you
          upload ("User Content"). By uploading content, you grant us a limited
          license to:
        </p>
        <ul>
          <li>Store and process your audio files</li>
          <li>Display your content to you and users you authorize</li>
          <li>
            Make public content available to other users when you explicitly
            choose to share it
          </li>
          <li>Create technical copies for backup and service operation</li>
        </ul>

        <h3>4.2 Copyright Compliance</h3>
        <p>
          <strong>You represent and warrant that:</strong>
        </p>
        <ul>
          <li>You own or have the legal right to upload all User Content</li>
          <li>
            Your content does not infringe on any third-party copyrights,
            trademarks, or other intellectual property rights
          </li>
          <li>
            You have obtained all necessary permissions and licenses for any
            content you upload
          </li>
        </ul>

        <h3>4.3 Prohibited Content</h3>
        <p>You may not upload content that:</p>
        <ul>
          <li>Infringes on intellectual property rights of others</li>
          <li>
            Contains illegal material or promotes illegal activities
          </li>
          <li>
            Contains malware, viruses, or other harmful code
          </li>
          <li>
            Is defamatory, obscene, pornographic, or offensive
          </li>
          <li>
            Violates privacy rights or contains personal information of others
            without consent
          </li>
          <li>Promotes hate speech, violence, or discrimination</li>
          <li>
            Impersonates any person or entity
          </li>
        </ul>

        <h2>5. DMCA Copyright Policy</h2>
        <p>
          We respect intellectual property rights and comply with the Digital
          Millennium Copyright Act (DMCA). If you believe your copyrighted work
          has been infringed:
        </p>
        <ul>
          <li>
            Submit a DMCA takedown notice to our contact information below.
          </li>
          <li>Include all required information as specified by DMCA</li>
          <li>
            We will investigate and remove infringing content within 24-48 hours
          </li>
        </ul>
        <p>
          <strong>Repeat Infringers:</strong> Users who repeatedly violate
          copyright will have their accounts terminated.
        </p>

        <h2>6. Acceptable Use Policy</h2>
        <p>You agree NOT to:</p>
        <ul>
          <li>Use the Service for any illegal purpose</li>
          <li>
            Attempt to gain unauthorized access to the Service or other user
            accounts
          </li>
          <li>
            Interfere with or disrupt the Service or servers
          </li>
          <li>
            Upload excessively large files or abuse storage resources
          </li>
          <li>Use automated tools to scrape or download content</li>
          <li>
            Reverse engineer or attempt to extract source code
          </li>
          <li>Resell or commercialize the Service without permission</li>
          <li>
            Spam, harass, or send unsolicited messages to other users
          </li>
        </ul>

        <h2>7. Public Content and Sharing</h2>
        <ul>
          <li>
            Content marked as "public" will be accessible to anyone with the
            link
          </li>
          <li>You are solely responsible for content you choose to share</li>
          <li>We are not responsible for how others use your public content</li>
          <li>You can change content from public to private at any time</li>
        </ul>

        <h2>8. Service Modifications and Availability</h2>
        <ul>
          <li>
            We reserve the right to modify or discontinue the Service at any
            time
          </li>
          <li>
            We may perform maintenance that temporarily interrupts service
          </li>
          <li>
            We do not guarantee 100% uptime or availability
          </li>
          <li>We may impose storage or usage limits</li>
        </ul>

        <h2>9. Account Termination</h2>
        <h3>9.1 By You</h3>
        <p>
          You may delete your account at any time through the settings page. Upon
          deletion:
        </p>
        <ul>
          <li>Your account will be deactivated immediately</li>
          <li>
            Soft-deleted content will be permanently removed after 30 days
          </li>
          <li>Some data may be retained for legal or backup purposes</li>
        </ul>

        <h3>9.2 By Us</h3>
        <p>
          We may suspend or terminate your account if you:
        </p>
        <ul>
          <li>Violate these Terms of Service</li>
          <li>Engage in fraudulent or illegal activities</li>
          <li>Upload prohibited content</li>
          <li>Are a repeat copyright infringer</li>
          <li>Abuse or disrupt the Service</li>
        </ul>

        <h2>10. Data Backup and Loss</h2>
        <p>
          While we implement backup procedures, <strong>you are responsible for
          maintaining your own backups</strong> of important content. We are not
          liable for any data loss, corruption, or deletion.
        </p>

        <h2>11. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
          OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul>
          <li>Warranties of merchantability or fitness for a particular purpose</li>
          <li>Warranties of non-infringement</li>
          <li>Warranties that the Service will be uninterrupted or error-free</li>
          <li>Warranties regarding the accuracy or reliability of content</li>
        </ul>

        <h2>12. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
        </p>
        <ul>
          <li>
            Any indirect, incidental, special, consequential, or punitive damages
          </li>
          <li>Loss of profits, data, use, or goodwill</li>
          <li>Service interruptions or data loss</li>
          <li>Unauthorized access to your account or content</li>
          <li>Errors, mistakes, or inaccuracies of content</li>
          <li>Actions or content of other users</li>
        </ul>
        <p>
          Our total liability shall not exceed the amount you paid us in the
          past 12 months, or $100, whichever is greater.
        </p>

        <h2>13. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Audio Marker, its operators,
          and affiliates from any claims, damages, losses, or expenses (including
          legal fees) arising from:
        </p>
        <ul>
          <li>Your use of the Service</li>
          <li>Your User Content</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any rights of another party</li>
        </ul>

        <h2>14. Privacy</h2>
        <p>
          Your use of the Service is also governed by our{" "}
          <a href="/privacy">Privacy Policy</a>. Please review it to understand
          our data practices.
        </p>

        <h2>15. Third-Party Services</h2>
        <p>
          The Service integrates with third-party services (authentication
          providers, error tracking, etc.). Your use of these services is subject
          to their respective terms and policies.
        </p>

        <h2>16. Dispute Resolution</h2>
        <h3>16.1 Governing Law</h3>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of [Your Jurisdiction], without regard to conflict of law
          principles.
        </p>

        <h3>16.2 Dispute Process</h3>
        <ul>
          <li>
            Contact us first to resolve disputes informally
          </li>
          <li>
            If informal resolution fails, disputes will be resolved through
            binding arbitration
          </li>
          <li>You waive the right to participate in class action lawsuits</li>
        </ul>

        <h2>17. Changes to Terms</h2>
        <p>
          We may update these Terms at any time. We will notify users of material
          changes via:
        </p>
        <ul>
          <li>Email notification to your registered address</li>
          <li>Prominent notice on the Service</li>
          <li>Update to the "Last updated" date above</li>
        </ul>
        <p>
          Continued use after changes constitutes acceptance of the updated
          Terms.
        </p>

        <h2>18. Severability</h2>
        <p>
          If any provision of these Terms is found to be unenforceable, the
          remaining provisions will remain in full effect.
        </p>

        <h2>19. Entire Agreement</h2>
        <p>
          These Terms, together with the Privacy Policy and DMCA Policy,
          constitute the entire agreement between you and Audio Marker.
        </p>

        <h2>20. Contact Information</h2>
        <p>For questions about these Terms, contact us at:</p>
        <ul>
          <li>
            <strong>Email:</strong> {contactEmail}
          </li>
          <li>
            <strong>GitHub Issues:</strong>{" "}
            <a
              href="https://github.com/danielraab/AudioMarker/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/danielraab/AudioMarker/issues
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
