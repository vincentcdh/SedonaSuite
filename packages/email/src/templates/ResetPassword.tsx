import * as React from 'react'
import { Text, Link, Button } from '@react-email/components'
import { EmailLayout, styles } from './shared'

export interface ResetPasswordProps {
  name: string
  resetUrl: string
  expiresIn?: string
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  name,
  resetUrl,
  expiresIn = '1 heure',
}) => (
  <EmailLayout preview="Reinitialisation de votre mot de passe">
    <Text style={styles.h1}>Reinitialisation du mot de passe</Text>

    <Text style={styles.text}>Bonjour {name},</Text>

    <Text style={styles.text}>
      Nous avons recu une demande de reinitialisation de votre mot de passe
      Sedona.AI. Cliquez sur le bouton ci-dessous pour definir un nouveau mot de
      passe.
    </Text>

    <Button href={resetUrl} style={styles.button}>
      Reinitialiser mon mot de passe
    </Button>

    <Text style={styles.text}>
      Ou copiez et collez ce lien dans votre navigateur :
      <br />
      <Link href={resetUrl} style={styles.link}>
        {resetUrl}
      </Link>
    </Text>

    <Text style={styles.text}>
      Ce lien expirera dans <strong>{expiresIn}</strong>.
    </Text>

    <Text style={styles.text}>
      Si vous n'avez pas demande de reinitialisation de mot de passe, vous
      pouvez ignorer cet email. Votre mot de passe actuel restera inchange.
    </Text>

    <Text style={styles.text}>
      Pour toute question, contactez notre support a{' '}
      <Link href="mailto:support@sedona.ai" style={styles.link}>
        support@sedona.ai
      </Link>
      .
    </Text>
  </EmailLayout>
)

export default ResetPassword
