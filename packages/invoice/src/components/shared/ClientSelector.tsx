import type { FC } from 'react'
import { useState, useMemo } from 'react'
import { Input } from '@sedona/ui'
import { Building2, Search, User, Plus } from 'lucide-react'
import type { InvoiceClient } from '../../types'

// Type pour les entrées CRM (contacts et entreprises)
export interface CrmEntry {
  id: string
  type: 'contact' | 'company'
  name: string
  email: string | null
  siret?: string | null
  // Données pour créer un client de facturation
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  postalCode?: string | null
  country?: string
  phone?: string | null
}

interface ClientSelectorProps {
  clients: InvoiceClient[]
  crmEntries?: CrmEntry[]
  value?: string
  onSelect: (client: InvoiceClient) => void
  onSelectCrmEntry?: (entry: CrmEntry) => void
  placeholder?: string
}

export const ClientSelector: FC<ClientSelectorProps> = ({
  clients,
  crmEntries = [],
  value,
  onSelect,
  onSelectCrmEntry,
  placeholder = 'Rechercher un client...',
}) => {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === value)
  }, [clients, value])

  // Filtrer les clients de facturation
  const filteredClients = useMemo(() => {
    if (!search) return clients.slice(0, 5)
    const lower = search.toLowerCase()
    return clients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.billingEmail?.toLowerCase().includes(lower) ||
          c.siret?.includes(lower)
      )
      .slice(0, 5)
  }, [clients, search])

  // Filtrer les entrées CRM (exclure celles déjà liées à un client de facturation)
  const filteredCrmEntries = useMemo(() => {
    if (!search && crmEntries.length === 0) return []

    // IDs des contacts/entreprises CRM déjà liés à des clients de facturation
    const linkedCrmIds = new Set(
      clients
        .filter((c) => c.crmContactId || c.crmCompanyId)
        .flatMap((c) => [c.crmContactId, c.crmCompanyId].filter(Boolean))
    )

    const lower = search.toLowerCase()
    return crmEntries
      .filter((entry) => !linkedCrmIds.has(entry.id))
      .filter((entry) => {
        if (!search) return true
        return (
          entry.name.toLowerCase().includes(lower) ||
          entry.email?.toLowerCase().includes(lower) ||
          entry.siret?.includes(lower)
        )
      })
      .slice(0, 5)
  }, [crmEntries, clients, search])

  const handleSelect = (client: InvoiceClient) => {
    onSelect(client)
    setIsOpen(false)
    setSearch('')
  }

  const handleSelectCrmEntry = (entry: CrmEntry) => {
    if (onSelectCrmEntry) {
      onSelectCrmEntry(entry)
    }
    setIsOpen(false)
    setSearch('')
  }

  const hasResults = filteredClients.length > 0 || filteredCrmEntries.length > 0

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={selectedClient ? selectedClient.name : search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Liste des résultats */}
          <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-80 overflow-auto">
            {!hasResults ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Aucun client trouvé
              </div>
            ) : (
              <>
                {/* Section: Clients de facturation existants */}
                {filteredClients.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 sticky top-0">
                      Clients de facturation
                    </div>
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-3 transition-colors"
                        onClick={() => handleSelect(client)}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{client.name}</p>
                          {client.billingEmail && (
                            <p className="text-sm text-muted-foreground truncate">
                              {client.billingEmail}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Section: Entrées CRM (non encore liées) */}
                {filteredCrmEntries.length > 0 && onSelectCrmEntry && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 sticky top-0 flex items-center gap-2">
                      <Plus className="h-3 w-3" />
                      Importer depuis le CRM
                    </div>
                    {filteredCrmEntries.map((entry) => (
                      <button
                        key={`crm-${entry.type}-${entry.id}`}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-3 transition-colors border-l-2 border-l-blue-500"
                        onClick={() => handleSelectCrmEntry(entry)}
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          {entry.type === 'contact' ? (
                            <User className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Building2 className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{entry.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {entry.email || (entry.type === 'contact' ? 'Contact CRM' : 'Entreprise CRM')}
                          </p>
                        </div>
                        <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                          {entry.type === 'contact' ? 'Contact' : 'Entreprise'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
