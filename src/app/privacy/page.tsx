import { type Metadata } from "next";
import { env } from "~/env";

export const metadata: Metadata = {
  title: "Privacy Policy - Audio Marker",
  description: "Privacy Policy for Audio Marker application",
};

export default function PrivacyPolicy() {
  const contactEmail = (env.CONTACT_EMAIL) as string;
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Last updated: October 27, 2025
        </p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to Audio Marker ("we," "our," or "us"). We are committed to
          protecting your personal information and your right to privacy. This
          Privacy Policy explains how we collect, use, disclose, and safeguard
          your information when you use our web application.
        </p>

        <h2>2. Information We Collect</h2>
        
        <h3>2.1 Information You Provide</h3>
        <ul>
          <li>
            <strong>Account Information:</strong> Email address, name, and
            authentication credentials when you create an account
          </li>
          <li>
            <strong>Audio Content:</strong> Audio files you upload, including
            metadata, markers, and annotations
          </li>
          <li>
            <strong>Playlists:</strong> Playlist information, organization, and
            settings you create
          </li>
          <li>
            <strong>User Preferences:</strong> Language preferences, display
            settings, and other customization options
          </li>
        </ul>

        <h3>2.2 Automatically Collected Information</h3>
        <ul>
          <li>
            <strong>Usage Statistics:</strong> Listen counts, timestamps, and
            interaction data with audio files and playlists
          </li>
          <li>
            <strong>Technical Data:</strong> IP address, browser type, device
            information, and operating system
          </li>
          <li>
            <strong>Cookies:</strong> Session cookies, preference cookies, and
            analytics cookies (see Cookie Policy below)
          </li>
          <li>
            <strong>Error Logs:</strong> Error reports and diagnostic
            information via Sentry for application improvement
          </li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use the collected information for:</p>
        <ul>
          <li>Providing and maintaining the Audio Marker service</li>
          <li>User authentication and account management</li>
          <li>Storing and organizing your audio files and annotations</li>
          <li>Tracking usage statistics and improving user experience</li>
          <li>Debugging and error tracking via Sentry</li>
          <li>Communicating with you about service updates</li>
          <li>Ensuring security and preventing abuse</li>
          <li>Complying with legal obligations</li>
        </ul>

        <h2>4. Data Sharing and Disclosure</h2>
        <p>We do not sell your personal information. We may share data with:</p>
        <ul>
          <li>
            <strong>Service Providers:</strong> Third-party services like Sentry
            (error tracking) and authentication providers (NextAuth.js, OAuth
            providers)
          </li>
          <li>
            <strong>Public Content:</strong> Audio files and playlists you
            explicitly mark as "public" will be accessible to other users
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required by law,
            subpoena, or legal process
          </li>
          <li>
            <strong>Protection of Rights:</strong> To protect our rights,
            property, or safety, or that of our users
          </li>
        </ul>

        <h2>5. Your Rights (GDPR & CCPA)</h2>
        <p>You have the following rights regarding your personal data:</p>
        <ul>
          <li>
            <strong>Right to Access:</strong> Request a copy of your personal
            data
          </li>
          <li>
            <strong>Right to Rectification:</strong> Correct inaccurate or
            incomplete data
          </li>
          <li>
            <strong>Right to Erasure:</strong> Request deletion of your account
            and associated data
          </li>
          <li>
            <strong>Right to Data Portability:</strong> Receive your data in a
            structured, machine-readable format
          </li>
          <li>
            <strong>Right to Object:</strong> Object to certain data processing
            activities
          </li>
          <li>
            <strong>Right to Withdraw Consent:</strong> Withdraw consent for
            data processing at any time
          </li>
        </ul>
        <p>
          To exercise these rights, please contact us at the email address
          provided in the Contact section below.
        </p>

        <h2>6. Cookie Policy</h2>
        <p>We use the following types of cookies:</p>
        <ul>
          <li>
            <strong>Essential Cookies:</strong> Required for authentication and
            basic functionality (session management)
          </li>
          <li>
            <strong>Preference Cookies:</strong> Store your language and display
            settings
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how users
            interact with our application
          </li>
        </ul>
        <p>
          You can control cookies through your browser settings. Note that
          disabling essential cookies may affect functionality.
        </p>

        <h2>7. Data Security</h2>
        <p>
          We implement appropriate technical and organizational security
          measures to protect your personal information, including:
        </p>
        <ul>
          <li>Encrypted data transmission (HTTPS/SSL)</li>
          <li>Secure authentication via NextAuth.js</li>
          <li>Regular security updates and patches</li>
          <li>Access controls and authorization mechanisms</li>
          <li>Regular backups and disaster recovery procedures</li>
        </ul>
        <p>
          However, no method of transmission over the Internet is 100% secure.
          We cannot guarantee absolute security.
        </p>

        <h2>8. Data Retention</h2>
        <p>We retain your personal information for as long as:</p>
        <ul>
          <li>Your account is active</li>
          <li>Needed to provide you with our services</li>
          <li>Required by law or for legitimate business purposes</li>
        </ul>

        <h2>9. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries
          other than your country of residence. We ensure appropriate safeguards
          are in place for such transfers.
        </p>

        <h2>10. Children's Privacy</h2>
        <p>
          Our service is not intended for users under 13 years of age. We do not
          knowingly collect personal information from children under 13. If you
          believe we have collected information from a child, please contact us
          immediately.
        </p>

        <h2>11. Third-Party Services</h2>
        <p>Our application integrates with:</p>
        <ul>
          <li>
            <strong>NextAuth.js Providers:</strong> OAuth authentication
            providers (Google, GitHub, etc.) have their own privacy policies
          </li>
          <li>
            <strong>Sentry:</strong> Error tracking service with its own privacy
            policy at{" "}
            <a
              href="https://sentry.io/privacy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              sentry.io/privacy
            </a>
          </li>
        </ul>
        <p>
          We are not responsible for the privacy practices of these third-party
          services.
        </p>

        <h2>12. Data Breach Notification</h2>
        <p>
          In the event of a data breach that may compromise your personal
          information, we will notify affected users within 72 hours as required
          by GDPR and applicable laws.
        </p>

        <h2>13. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new policy on this page and updating
          the "Last updated" date. Continued use of the service after changes
          constitutes acceptance of the updated policy.
        </p>

        <h2>14. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or wish to exercise
          your rights, please contact us at:
        </p>
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
