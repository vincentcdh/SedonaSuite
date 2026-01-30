import * as React from 'react'
import { Text, Link, Button } from '@react-email/components'
import { EmailLayout, styles } from './shared'

export interface SubscriptionCanceledProps {
  name: string
  planName: string
  endDate: string
  reactivateUrl: string
}

export const SubscriptionCanceled: React.FC<SubscriptionCanceledProps> = ({
  name,
  planName,
  endDate,
  reactivateUrl,
}) => (
  <EmailLayout preview="Votre abonnement a ete annule">
    <Text style={styles.h1}>Votre abonnement a ete annule</Text>

    <Text style={styles.text}>Bonjour {name},</Text>

    <Text style={styles.text}>
      Nous confirmons l'annulation de votre abonnement{' '}
      <strong>{planName}</strong> sur Sedona.AI.
    </Text>

    <Text style={styles.text}>
      Vous conserverez l'acces a toutes les fonctionnalites de votre plan
      jusqu'au <strong>{endDate}</strong>. Apres cette date, votre compte
      passera automatiquement au plan Gratuit.
    </Text>

    <Text style={styles.text}>
      <strong>Ce que vous garderez :</strong>
      <br />
      - Vos donnees (contacts, factures, projets...)
      <br />
      - Acces au plan Gratuit avec ses limites
      <br />
      <br />
      <strong>Ce que vous perdrez :</strong>
      <br />
      - Fonctionnalites avancees du plan {planName}
      <br />
      - Limites etendues
    </Text>

    <Text style={styles.text}>
      Vous avez change d'avis ? Vous pouvez reactiver votre abonnement a tout
      moment.
    </Text>

    <Button href={reactivateUrl} style={styles.button}>
      Reactiver mon abonnement
    </Button>

    <Text style={styles.text}>
      Nous aimerions comprendre pourquoi vous partez. N'hesitez pas a nous
      faire part de vos retours a{' '}
      <Link href="mailto:feedback@sedona.ai" style={styles.link}>
        feedback@sedona.ai
      </Link>
      .
    </Text>

    <Text style={styles.text}>
      Merci d'avoir utilise Sedona.AI. Nous esperons vous revoir bientot !
      <br />
      L'equipe Sedona.AI
    </Text>
  </EmailLayout>
)

export default SubscriptionCanceled
