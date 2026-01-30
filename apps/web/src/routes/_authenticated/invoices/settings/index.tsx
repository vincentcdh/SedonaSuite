import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@sedona/ui'

// Simple Textarea component since it's not exported from @sedona/ui
const Textarea = ({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)
import {
  Building2,
  CreditCard,
  FileText,
  Hash,
  Mail,
  Save,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/invoices/settings/')({
  component: InvoiceSettingsPage,
})

function InvoiceSettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'bank' | 'numbering' | 'templates'>('company')

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Parametres de facturation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez vos informations d'entreprise et vos preferences de facturation
          </p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <Card className="w-64 h-fit shrink-0">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {[
                { id: 'company', label: 'Entreprise', icon: Building2 },
                { id: 'bank', label: 'Coordonnees bancaires', icon: CreditCard },
                { id: 'numbering', label: 'Numerotation', icon: Hash },
                { id: 'templates', label: 'Modeles', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'company' && <CompanySettings />}
          {activeTab === 'bank' && <BankSettings />}
          {activeTab === 'numbering' && <NumberingSettings />}
          {activeTab === 'templates' && <TemplateSettings />}
        </div>
      </div>
    </div>
  )
}

function CompanySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Informations de l'entreprise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom commercial</Label>
            <Input id="companyName" placeholder="Mon Entreprise" defaultValue="Sedona Solutions" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legalName">Raison sociale</Label>
            <Input id="legalName" placeholder="Mon Entreprise SARL" defaultValue="Sedona Solutions SAS" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input id="siret" placeholder="123 456 789 00012" defaultValue="123 456 789 00012" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber">N° TVA Intracommunautaire</Label>
            <Input id="vatNumber" placeholder="FR12345678901" defaultValue="FR12345678901" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legalForm">Forme juridique</Label>
            <Input id="legalForm" placeholder="SAS" defaultValue="SAS" />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Adresse</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="address1">Adresse</Label>
              <Input id="address1" placeholder="123 rue de la Paix" defaultValue="42 avenue des Champs-Elysees" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address2">Complement d'adresse</Label>
              <Input id="address2" placeholder="Batiment A, 2eme etage" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input id="postalCode" placeholder="75001" defaultValue="75008" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" placeholder="Paris" defaultValue="Paris" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input id="country" placeholder="France" defaultValue="France" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Contact</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="contact@entreprise.fr" defaultValue="contact@sedona.ai" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telephone</Label>
              <Input id="phone" placeholder="01 23 45 67 89" defaultValue="01 23 45 67 89" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input id="website" placeholder="www.entreprise.fr" defaultValue="www.sedona.ai" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BankSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Coordonnees bancaires
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Ces informations apparaitront sur vos factures pour permettre a vos clients de vous regler.
        </p>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Nom de la banque</Label>
            <Input id="bankName" placeholder="BNP Paribas" defaultValue="BNP Paribas" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input id="iban" placeholder="FR76 1234 5678 9012 3456 7890 123" defaultValue="FR76 1234 5678 9012 3456 7890 123" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bic">BIC / SWIFT</Label>
            <Input id="bic" placeholder="BNPAFRPP" defaultValue="BNPAFRPP" />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Conditions de paiement par defaut</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Delai de paiement (jours)</Label>
              <Input id="paymentTerms" type="number" defaultValue="30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteValidity">Validite des devis (jours)</Label>
              <Input id="quoteValidity" type="number" defaultValue="30" />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Mentions legales</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="latePaymentPenalty">Penalites de retard</Label>
              <Textarea
                id="latePaymentPenalty"
                placeholder="En cas de retard de paiement..."
                defaultValue="En cas de retard de paiement, une penalite de 3 fois le taux d'interet legal sera appliquee, ainsi qu'une indemnite forfaitaire de 40€ pour frais de recouvrement."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountTerms">Escompte</Label>
              <Textarea
                id="discountTerms"
                placeholder="Pas d'escompte pour paiement anticipe"
                defaultValue="Pas d'escompte pour paiement anticipe"
                rows={2}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NumberingSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Numerotation des documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Configurez le format de numerotation de vos factures, devis et avoirs.
        </p>

        {/* Factures */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Factures</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Prefixe</Label>
              <Input id="invoicePrefix" defaultValue="FAC-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoicePadding">Chiffres</Label>
              <Input id="invoicePadding" type="number" defaultValue="4" min="1" max="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceReset">Remise a zero</Label>
              <select
                id="invoiceReset"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="yearly"
              >
                <option value="never">Jamais</option>
                <option value="yearly">Chaque annee</option>
                <option value="monthly">Chaque mois</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Apercu</Label>
              <div className="h-10 flex items-center px-3 bg-muted rounded-md text-sm font-mono">
                FAC-2025-0001
              </div>
            </div>
          </div>
        </div>

        {/* Devis */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Devis</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="quotePrefix">Prefixe</Label>
              <Input id="quotePrefix" defaultValue="DEV-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quotePadding">Chiffres</Label>
              <Input id="quotePadding" type="number" defaultValue="4" min="1" max="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteReset">Remise a zero</Label>
              <select
                id="quoteReset"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="yearly"
              >
                <option value="never">Jamais</option>
                <option value="yearly">Chaque annee</option>
                <option value="monthly">Chaque mois</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Apercu</Label>
              <div className="h-10 flex items-center px-3 bg-muted rounded-md text-sm font-mono">
                DEV-2025-0001
              </div>
            </div>
          </div>
        </div>

        {/* Avoirs */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Avoirs</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="creditPrefix">Prefixe</Label>
              <Input id="creditPrefix" defaultValue="AVO-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditPadding">Chiffres</Label>
              <Input id="creditPadding" type="number" defaultValue="4" min="1" max="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditReset">Remise a zero</Label>
              <select
                id="creditReset"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="yearly"
              >
                <option value="never">Jamais</option>
                <option value="yearly">Chaque annee</option>
                <option value="monthly">Chaque mois</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Apercu</Label>
              <div className="h-10 flex items-center px-3 bg-muted rounded-md text-sm font-mono">
                AVO-2025-0001
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TemplateSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Modeles d'emails
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Personnalisez les emails envoyes automatiquement avec vos factures et devis.
        </p>

        {/* Invoice email */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Email de facture</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceEmailSubject">Objet</Label>
              <Input
                id="invoiceEmailSubject"
                defaultValue="Votre facture {{invoice_number}} - {{company_name}}"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceEmailBody">Corps du message</Label>
              <Textarea
                id="invoiceEmailBody"
                rows={6}
                defaultValue={`Bonjour {{client_name}},

Veuillez trouver ci-joint votre facture n°{{invoice_number}} d'un montant de {{total}} TTC.

Date d'echeance : {{due_date}}

Merci de votre confiance.

Cordialement,
{{company_name}}`}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Variables disponibles : {'{{client_name}}'}, {'{{invoice_number}}'}, {'{{total}}'}, {'{{due_date}}'}, {'{{company_name}}'}
            </p>
          </div>
        </div>

        {/* Quote email */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Email de devis</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quoteEmailSubject">Objet</Label>
              <Input
                id="quoteEmailSubject"
                defaultValue="Votre devis {{quote_number}} - {{company_name}}"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteEmailBody">Corps du message</Label>
              <Textarea
                id="quoteEmailBody"
                rows={6}
                defaultValue={`Bonjour {{client_name}},

Suite a notre echange, veuillez trouver ci-joint notre devis n°{{quote_number}} d'un montant de {{total}} TTC.

Ce devis est valable jusqu'au {{valid_until}}.

N'hesitez pas a nous contacter pour toute question.

Cordialement,
{{company_name}}`}
              />
            </div>
          </div>
        </div>

        {/* Reminder email */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Email de relance</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminderEmailSubject">Objet</Label>
              <Input
                id="reminderEmailSubject"
                defaultValue="Rappel : Facture {{invoice_number}} en attente de reglement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderEmailBody">Corps du message</Label>
              <Textarea
                id="reminderEmailBody"
                rows={6}
                defaultValue={`Bonjour {{client_name}},

Nous n'avons pas encore recu le reglement de la facture n°{{invoice_number}} d'un montant de {{amount_due}} TTC, dont l'echeance etait le {{due_date}}.

Merci de proceder au reglement dans les meilleurs delais.

Si vous avez deja effectue le paiement, merci de ne pas tenir compte de ce message.

Cordialement,
{{company_name}}`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
