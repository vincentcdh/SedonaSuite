import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components'

// ===========================================
// SHARED EMAIL STYLES
// ===========================================

export const styles = {
  main: {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  section: {
    padding: '0 48px',
  },
  logo: {
    margin: '0 auto',
    marginBottom: '24px',
  },
  h1: {
    color: '#333',
    fontSize: '24px',
    fontWeight: '600' as const,
    lineHeight: '1.4',
    margin: '24px 0',
  },
  text: {
    color: '#555',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '16px 0',
  },
  button: {
    backgroundColor: '#e85d04',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '14px 24px',
    margin: '24px 0',
  },
  link: {
    color: '#e85d04',
    textDecoration: 'underline',
  },
  hr: {
    borderColor: '#eee',
    margin: '32px 0',
  },
  footer: {
    color: '#999',
    fontSize: '12px',
    lineHeight: '1.5',
    marginTop: '32px',
    textAlign: 'center' as const,
  },
  code: {
    backgroundColor: '#f4f4f4',
    borderRadius: '4px',
    color: '#333',
    fontSize: '24px',
    fontWeight: '700' as const,
    letterSpacing: '4px',
    padding: '12px 24px',
    display: 'inline-block',
  },
}

// ===========================================
// EMAIL LAYOUT COMPONENT
// ===========================================

export interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ preview, children }) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.section}>
          {/* Logo */}
          <Img
            src="https://sedona.ai/logo.png"
            width="120"
            height="40"
            alt="Sedona.AI"
            style={styles.logo}
          />
          {children}
          <Hr style={styles.hr} />
          {/* Footer */}
          <Text style={styles.footer}>
            Sedona.AI - Suite SaaS pour TPE francaises
            <br />
            Vous recevez cet email car vous avez un compte Sedona.AI.
            <br />
            <Link href="https://sedona.ai/unsubscribe" style={styles.link}>
              Se desabonner
            </Link>
            {' | '}
            <Link href="https://sedona.ai/privacy" style={styles.link}>
              Politique de confidentialite
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
