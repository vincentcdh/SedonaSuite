import * as React from 'react'
import { Text, Link, Button } from '@react-email/components'
import { EmailLayout, styles } from './shared'

export interface SubscriptionConfirmedProps {
  name: string
  planName: string
  price: string
  interval: 'month' | 'year'
  nextBillingDate: string
  dashboardUrl: string
}

export const SubscriptionConfirmed: React.FC<SubscriptionConfirmedProps> = ({
  name,
  planName,
  price,
  interval,
  nextBillingDate,
  dashboardUrl,
}) => (
  <EmailLayout preview={`Votre abonnement ${planName} est confirme !`}>
    <Text style={styles.h1}>Merci pour votre abonnement !</Text>

    <Text style={styles.text}>Bonjour {name},</Text>

    <Text style={styles.text}>
      Votre abonnement au plan <strong>{planName}</strong> a ete active avec
      succes. Vous avez maintenant acces a toutes les fonctionnalites de ce
      plan.
    </Text>

    <Text style={styles.text}>
      <strong>Details de votre abonnement :</strong>
      <br />
      - Plan : {planName}
      <br />
      - Prix : {price}/{interval === 'month' ? 'mois' : 'an'}
      <br />
      - Prochain prelevement : {nextBillingDate}
    </Text>

    <Button href={dashboardUrl} style={styles.button}>
      Acceder a mon tableau de bord
    </Button>

    <Text style={styles.text}>
      Vous pouvez gerer votre abonnement a tout moment depuis les parametres de
      facturation de votre compte.
    </Text>

    <Text style={styles.text}>
      Une question ? Notre equipe est la pour vous aider :{' '}
      <Link href="mailto:support@sedona.ai" style={styles.link}>
        support@sedona.ai
      </Link>
    </Text>

    <Text style={styles.text}>
      Merci de faire confiance a Sedona.AI !
      <br />
      L'equipe Sedona.AI
    </Text>
  </EmailLayout>
)

export default SubscriptionConfirmed
