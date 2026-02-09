import type { FC } from 'react'
import { useState, useMemo } from 'react'
import { Input } from '@sedona/ui'
import { Building2, Search } from 'lucide-react'
import type { InvoiceClient } from '../../types'

interface ClientSelectorProps {
  clients: InvoiceClient[]
  value?: string
  onSelect: (client: InvoiceClient) => void
  placeholder?: string
}

export const ClientSelector: FC<ClientSelectorProps> = ({
  clients,
  value,
  onSelect,
  placeholder = 'Rechercher un client...',
}) => {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === value)
  }, [clients, value])

  const filteredClients = useMemo(() => {
    if (!search) return clients.slice(0, 10)
    const lower = search.toLowerCase()
    return clients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.billingEmail?.toLowerCase().includes(lower) ||
          c.siret?.includes(lower)
      )
      .slice(0, 10)
  }, [clients, search])

  const handleSelect = (client: InvoiceClient) => {
    onSelect(client)
    setIsOpen(false)
    setSearch('')
  }

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

          {/* Liste des clients */}
          <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredClients.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Aucun client trouve
              </div>
            ) : (
              filteredClients.map((client) => (
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
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
