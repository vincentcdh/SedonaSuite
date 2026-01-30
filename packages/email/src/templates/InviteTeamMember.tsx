import * as React from 'react'
import { Text, Link, Button } from '@react-email/components'
import { EmailLayout, styles } from './shared'

export interface InviteTeamMemberProps {
  inviterName: string
  organizationName: string
  inviteUrl: string
  role: string
  expiresIn?: string
}

export const InviteTeamMember: React.FC<InviteTeamMemberProps> = ({
  inviterName,
  organizationName,
  inviteUrl,
  role,
  expiresIn = '7 jours',
}) => (
  <EmailLayout preview={`${inviterName} vous invite a rejoindre ${organizationName}`}>
    <Text style={styles.h1}>Vous etes invite a rejoindre {organizationName}</Text>

    <Text style={styles.text}>
      <strong>{inviterName}</strong> vous invite a rejoindre l'organisation{' '}
      <strong>{organizationName}</strong> sur Sedona.AI en tant que{' '}
      <strong>{role}</strong>.
    </Text>

    <Text style={styles.text}>
      Sedona.AI est une suite SaaS complete pour gerer votre entreprise :
      CRM, facturation, projets, tickets, et bien plus.
    </Text>

    <Button href={inviteUrl} style={styles.button}>
      Accepter l'invitation
    </Button>

    <Text style={styles.text}>
      Ou copiez et collez ce lien dans votre navigateur :
      <br />
      <Link href={inviteUrl} style={styles.link}>
        {inviteUrl}
      </Link>
    </Text>

    <Text style={styles.text}>
      Cette invitation expirera dans <strong>{expiresIn}</strong>.
    </Text>

    <Text style={styles.text}>
      Si vous ne connaissez pas {inviterName} ou {organizationName}, vous
      pouvez ignorer cet email en toute securite.
    </Text>
  </EmailLayout>
)

export default InviteTeamMember
