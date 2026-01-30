import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Separator,
} from '@sedona/ui'
import { useSession, useOrganization } from '@/lib/auth'
import {
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  UserX,
  Crown,
  Clock,
} from 'lucide-react'
import { cn } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/settings/team')({
  component: TeamSettingsPage,
})

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'pending'
  joinedAt?: string
}

// Mock data - replace with actual API call
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean@entreprise.fr',
    role: 'owner',
    status: 'active',
    joinedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Marie Martin',
    email: 'marie@entreprise.fr',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Pierre Durand',
    email: 'pierre@entreprise.fr',
    role: 'member',
    status: 'pending',
  },
]

function TeamSettingsPage() {
  const { data: session } = useSession()
  const { organization } = useOrganization()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers)

  const currentUserEmail = session?.user?.email
  const plan = organization?.subscriptionPlan || 'FREE'
  const maxUsers = plan === 'ENTERPRISE' ? Infinity : plan === 'PRO' ? 5 : 1
  const canInvite = teamMembers.length < maxUsers

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !canInvite) return

    setIsInviting(true)
    try {
      // TODO: Implement invite API call
      console.log('Inviting:', inviteEmail, 'as', inviteRole)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setInviteEmail('')
    } catch (error) {
      console.error('Failed to invite:', error)
    } finally {
      setIsInviting(false)
    }
  }

  const getRoleBadge = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-500">
            <Crown className="h-3 w-3 mr-1" />
            Proprietaire
          </Badge>
        )
      case 'admin':
        return (
          <Badge variant="secondary">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      default:
        return <Badge variant="outline">Membre</Badge>
    }
  }

  const getStatusBadge = (status: TeamMember['status']) => {
    if (status === 'pending') {
      return (
        <Badge variant="outline" className="text-warning border-warning">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Invite Member */}
      <Card>
        <CardHeader>
          <CardTitle>Inviter un membre</CardTitle>
          <CardDescription>
            Ajoutez des membres a votre equipe pour collaborer sur Sedona.AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!canInvite ? (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning font-medium">
                Limite atteinte ({teamMembers.length}/{maxUsers} utilisateurs)
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Passez a un plan superieur pour ajouter plus de membres.
              </p>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="collegue@entreprise.fr"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="sm:w-40 space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="member">Membre</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={isInviting || !inviteEmail}>
                <UserPlus className="h-4 w-4 mr-2" />
                {isInviting ? 'Envoi...' : 'Envoyer l\'invitation'}
              </Button>
            </form>
          )}

          <div className="mt-4 text-xs text-muted-foreground">
            {teamMembers.length}/{maxUsers === Infinity ? '∞' : maxUsers} utilisateurs
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Membres de l'equipe</CardTitle>
          <CardDescription>
            Gerez les acces et les roles de votre equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={member.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-medium text-sm">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{member.name}</p>
                        {getRoleBadge(member.role)}
                        {getStatusBadge(member.status)}
                        {member.email === currentUserEmail && (
                          <Badge variant="outline" className="text-xs">Vous</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>

                  {member.role !== 'owner' && member.email !== currentUserEmail && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.status === 'pending' && (
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Renvoyer l'invitation
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Changer le role
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-error focus:text-error">
                          <UserX className="h-4 w-4 mr-2" />
                          Retirer de l'equipe
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles et permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <Crown className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Proprietaire</p>
                <p className="text-muted-foreground">
                  Acces complet, gestion de la facturation et transfert de propriete
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-muted-foreground">
                  Gestion des membres, parametres de l'organisation
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <UserPlus className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Membre</p>
                <p className="text-muted-foreground">
                  Acces aux modules selon les permissions definies
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
