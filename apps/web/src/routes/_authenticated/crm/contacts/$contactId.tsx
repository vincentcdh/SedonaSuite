import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@sedona/ui'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  CheckSquare,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/crm/contacts/$contactId')({
  component: ContactDetailPage,
})

// Mock contact for demonstration
const mockContact = {
  id: '1',
  firstName: 'Marie',
  lastName: 'Dupont',
  email: 'marie.dupont@example.com',
  phone: '+33 6 12 34 56 78',
  mobile: '+33 7 12 34 56 78',
  company: 'Acme Corp',
  companyId: '1',
  jobTitle: 'Directrice Marketing',
  tags: ['client', 'vip'],
  address: {
    line1: '123 Rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
  },
  source: 'Site web',
  createdAt: '2024-01-15',
  lastActivity: '2024-12-20',
}

const mockActivities = [
  {
    id: '1',
    type: 'email',
    subject: 'Envoi de la proposition commerciale',
    date: '2024-12-20',
    completed: true,
  },
  {
    id: '2',
    type: 'call',
    subject: 'Appel de suivi',
    date: '2024-12-18',
    completed: true,
  },
  {
    id: '3',
    type: 'meeting',
    subject: 'Reunion de presentation',
    date: '2024-12-15',
    completed: true,
  },
  {
    id: '4',
    type: 'task',
    subject: 'Preparer le devis',
    date: '2024-12-22',
    completed: false,
  },
]

function ContactDetailPage() {
  const { contactId } = Route.useParams()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return Mail
      case 'call':
        return Phone
      case 'meeting':
        return Calendar
      case 'task':
        return CheckSquare
      default:
        return FileText
    }
  }

  return (
    <div className="page-container">
      {/* Back button and actions */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/crm/contacts" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour aux contacts
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="outline" size="sm" className="text-error hover:text-error">
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-medium">
                  {mockContact.firstName[0]}
                  {mockContact.lastName[0]}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold font-heading">
                    {mockContact.firstName} {mockContact.lastName}
                  </h1>
                  <p className="text-muted-foreground">{mockContact.jobTitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {mockContact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coordonnees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${mockContact.email}`} className="text-sm hover:text-primary">
                      {mockContact.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telephone</p>
                    <a href={`tel:${mockContact.phone}`} className="text-sm hover:text-primary">
                      {mockContact.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Entreprise</p>
                    <Link
                      to="/crm/companies/$companyId"
                      params={{ companyId: mockContact.companyId }}
                      className="text-sm hover:text-primary"
                    >
                      {mockContact.company}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Adresse</p>
                    <p className="text-sm">
                      {mockContact.address.line1}, {mockContact.address.postalCode}{' '}
                      {mockContact.address.city}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Activites</CardTitle>
              <Button size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Nouvelle activite
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${activity.completed ? 'bg-muted' : 'bg-primary/10'}`}>
                        <Icon className={`h-4 w-4 ${activity.completed ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {activity.subject}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {activity.date}
                        </p>
                      </div>
                      {!activity.completed && (
                        <Button variant="ghost" size="sm">
                          Terminer
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Envoyer un email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Planifier un appel
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Planifier une reunion
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckSquare className="h-4 w-4 mr-2" />
                Creer une tache
              </Button>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="text-sm">{mockContact.source}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cree le</p>
                <p className="text-sm">{mockContact.createdAt}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Derniere activite</p>
                <p className="text-sm">{mockContact.lastActivity}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
