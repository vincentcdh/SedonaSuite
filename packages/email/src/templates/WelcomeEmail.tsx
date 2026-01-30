import * as React from 'react'
import { Text, Link, Button } from '@react-email/components'
import { EmailLayout, styles } from './shared'

export interface WelcomeEmailProps {
  name: string
  organizationName?: string
  loginUrl: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  name,
  organizationName,
  loginUrl,
}) => (
  <EmailLayout preview="Bienvenue sur Sedona.AI !">
    <Text style={styles.h1}>Bienvenue sur Sedona.AI, {name} !</Text>

    <Text style={styles.text}>
      Nous sommes ravis de vous accueillir sur Sedona.AI, la suite tout-en-un
      pour gerer votre {organizationName ? `entreprise ${organizationName}` : 'entreprise'}.
    </Text>

    <Text style={styles.text}>
      Votre compte a ete cree avec succes. Vous pouvez maintenant acceder a :
    </Text>

    <Text style={styles.text}>
      - <strong>CRM</strong> : Gerez vos contacts et opportunites
      <br />
      - <strong>Facturation</strong> : Creez et envoyez des factures conformes
      <br />
      - <strong>Projets</strong> : Suivez vos projets et taches
      <br />
      - <strong>Tickets</strong> : Gerez le support client
      <br />
      Et bien plus encore...
    </Text>

    <Button href={loginUrl} style={styles.button}>
      Acceder a mon compte
    </Button>

    <Text style={styles.text}>
      Besoin d'aide pour demarrer ?{' '}
      <Link href="https://sedona.ai/docs" style={styles.link}>
        Consultez notre documentation
      </Link>{' '}
      ou{' '}
      <Link href="mailto:support@sedona.ai" style={styles.link}>
        contactez notre support
      </Link>
      .
    </Text>

    <Text style={styles.text}>
      A bientot,
      <br />
      L'equipe Sedona.AI
    </Text>
  </EmailLayout>
)

export default WelcomeEmail
