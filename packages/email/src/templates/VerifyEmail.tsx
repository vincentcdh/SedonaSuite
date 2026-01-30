import * as React from 'react'
import { Text, Link, Button } from '@react-email/components'
import { EmailLayout, styles } from './shared'

export interface VerifyEmailProps {
  name: string
  verifyUrl: string
  expiresIn?: string
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({
  name,
  verifyUrl,
  expiresIn = '24 heures',
}) => (
  <EmailLayout preview="Verifiez votre adresse email">
    <Text style={styles.h1}>Verifiez votre adresse email</Text>

    <Text style={styles.text}>Bonjour {name},</Text>

    <Text style={styles.text}>
      Merci de vous etre inscrit sur Sedona.AI. Pour finaliser la creation de
      votre compte, veuillez verifier votre adresse email en cliquant sur le
      bouton ci-dessous.
    </Text>

    <Button href={verifyUrl} style={styles.button}>
      Verifier mon email
    </Button>

    <Text style={styles.text}>
      Ou copiez et collez ce lien dans votre navigateur :
      <br />
      <Link href={verifyUrl} style={styles.link}>
        {verifyUrl}
      </Link>
    </Text>

    <Text style={styles.text}>
      Ce lien expirera dans <strong>{expiresIn}</strong>.
    </Text>

    <Text style={styles.text}>
      Si vous n'avez pas cree de compte Sedona.AI, vous pouvez ignorer cet email
      en toute securite.
    </Text>
  </EmailLayout>
)

export default VerifyEmail
