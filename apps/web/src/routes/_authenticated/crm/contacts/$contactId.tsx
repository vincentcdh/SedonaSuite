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
  Loader2,
  User,
} from 'lucide-react'
import { useContact, useContactActivities, useCompleteActivity } from '@sedona/crm'

export const Route = createFileRoute('/_authenticated/crm/contacts/$contactId')({
  component: ContactDetailPage,
})

function ContactDetailPage() {
  const { contactId } = Route.useParams()

  // Fetch contact from Supabase
  const { data: contact, isLoading, error } = useContact(contactId)

  // Fetch contact activities
  const { data: activitiesData, isLoading: isLoadingActivities } = useContactActivities(contactId)
  const activities = activitiesData?.data || []

  // Complete activity mutation
  const completeActivityMutation = useCompleteActivity()

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

  const handleCompleteActivity = (activityId: string) => {
    completeActivityMutation.mutate(activityId)
  }

  if (error) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement du contact</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          <Link to="/crm/contacts" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux contacts
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Contact non trouve</p>
          <p className="text-sm text-muted-foreground mt-2">
            Ce contact n'existe pas ou a ete supprime.
          </p>
          <Link to="/crm/contacts" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux contacts
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const tags = (contact as any).tags || []

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
                  {contact.firstName?.[0] || ''}
                  {contact.lastName?.[0] || ''}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold font-heading">
                    {contact.firstName} {contact.lastName}
                  </h1>
                  <p className="text-muted-foreground">{contact.jobTitle || '-'}</p>
                  {tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      {tags.map((tag: any) => (
                        <span
                          key={tag.id || tag.name}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
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
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="text-sm hover:text-primary">
                        {contact.email}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telephone</p>
                    {contact.phone ? (
                      <a href={`tel:${contact.phone}`} className="text-sm hover:text-primary">
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                {(contact as any).company && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Entreprise</p>
                      <Link
                        to="/crm/companies/$companyId"
                        params={{ companyId: (contact as any).company.id }}
                        className="text-sm hover:text-primary"
                      >
                        {(contact as any).company.name}
                      </Link>
                    </div>
                  </div>
                )}
                {(contact.addressLine1 || contact.city) && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Adresse</p>
                      <p className="text-sm">
                        {contact.addressLine1 && `${contact.addressLine1}, `}
                        {contact.postalCode && `${contact.postalCode} `}
                        {contact.city}
                      </p>
                    </div>
                  </div>
                )}
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
              {isLoadingActivities ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune activite pour ce contact</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity: any) => {
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
                          {activity.dueDate && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(activity.dueDate).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        {!activity.completed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCompleteActivity(activity.id)}
                            disabled={completeActivityMutation.isPending}
                          >
                            Terminer
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
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
                <p className="text-sm">{contact.source || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cree le</p>
                <p className="text-sm">
                  {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString('fr-FR') : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Derniere modification</p>
                <p className="text-sm">
                  {contact.updatedAt ? new Date(contact.updatedAt).toLocaleDateString('fr-FR') : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
