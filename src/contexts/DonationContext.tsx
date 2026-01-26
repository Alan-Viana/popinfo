import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'

export interface Donation {
  id?: number
  titulo: string
  descricao: string
  categoria: string
  quantidade: string
  local?: string // Deprecated, kept for backward compatibility
  address: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  zip: string
  hours: string
  contatoEmail: string
  contatoTelefone: string
}

interface DonationContextType {
  donations: Donation[]
  addDonation: (donation: Donation) => Promise<void>
  deleteDonation: (id: number) => Promise<void>
  searchDonations: (query: string) => Donation[]
  isLoading: boolean
}

const DonationContext = createContext<DonationContextType | undefined>(undefined)

export const DonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDonations = async () => {
    setIsLoading(true)
    try {
      if (isSupabaseEnabled() && supabase) {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        if (data) {
          const mappedDonations: Donation[] = data.map(d => ({
            id: d.id,
            titulo: d.titulo,
            descricao: d.descricao,
            categoria: d.categoria,
            quantidade: d.quantidade,
            local: d.local,
            address: d.address || d.local || '',
            number: d.number || '',
            complement: d.complement || '',
            neighborhood: d.neighborhood || '',
            city: d.city || '',
            zip: d.zip || '',
            hours: d.hours || '',
            contatoEmail: d.contato_email,
            contatoTelefone: d.contato_telefone
          }))
          setDonations(mappedDonations)
        }
      } else {
        // Fallback to localStorage
        let existing = JSON.parse(localStorage.getItem('popinfo_doacoes') || '[]') as Donation[]
        
        // Migration: Ensure all donations have an ID and update old emails
        let hasChanges = false
        existing = existing.map((d, index) => {
          let modified = { ...d }
          let changed = false

          if (!d.id) {
            modified.id = Date.now() + index
            changed = true
          }

          // Migrate old emails to new generic email
          if (d.contatoEmail === 'doacoes@popinfo.dev' || d.contatoEmail === 'teste@email.com') {
            modified.contatoEmail = 'doacoes@email.com'
            changed = true
          }

          if (!d.address) {
            modified.address = d.local || ''
            modified.number = ''
            modified.neighborhood = ''
            modified.city = 'São Paulo'
             modified.zip = ''
             modified.hours = '08:00 às 17:00' // Default hours
             changed = true
           }
 
           if (changed) {
            hasChanges = true
            return modified
          }
          return d
        })

        if (hasChanges) {
          localStorage.setItem('popinfo_doacoes', JSON.stringify(existing))
        }

        if (existing.length === 0) {
          const samples: Donation[] = [
            {
              id: 1,
              titulo: 'Cadeira de rodas adulto',
              descricao: 'Cadeira de rodas em bom estado, ideal para adultos. Entrega combinada.',
              categoria: 'Cadeira de rodas',
              quantidade: '1 unidade',
              local: 'Vila Mariana, São Paulo',
              address: 'Rua Domingos de Morais',
              number: '2000',
              neighborhood: 'Vila Mariana',
              city: 'São Paulo',
              zip: '04009-000',
              hours: '09:00 às 18:00',
              contatoEmail: 'doacoes@email.com',
              contatoTelefone: '(11) 90000-0000'
            },
            {
              id: 2,
              titulo: 'Muletas tamanho M',
              descricao: 'Par de muletas com regulagem, tamanho M. Retirada no local.',
              categoria: 'Muletas',
              quantidade: '2 unidades',
              local: 'Centro, São Paulo',
              address: 'Praça da Sé',
              number: '10',
              neighborhood: 'Centro',
              city: 'São Paulo',
              zip: '01001-000',
              hours: '10:00 às 16:00',
              contatoEmail: 'doacoes@email.com',
              contatoTelefone: '(11) 98888-8888'
            }
          ]
          localStorage.setItem('popinfo_doacoes', JSON.stringify(samples))
          setDonations(samples)
        } else {
          setDonations(existing)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar doações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [])

  const addDonation = useCallback(async (donation: Donation) => {
    try {
      if (isSupabaseEnabled() && supabase) {
        const { error } = await supabase.from('donations').insert([{
          titulo: donation.titulo,
          descricao: donation.descricao,
          categoria: donation.categoria,
          quantidade: donation.quantidade,
          address: donation.address,
          number: donation.number,
          complement: donation.complement,
          neighborhood: donation.neighborhood,
          city: donation.city,
          zip: donation.zip,
          hours: donation.hours,
          contato_email: donation.contatoEmail,
          contato_telefone: donation.contatoTelefone
        }])
        
        if (error) throw error
        
        await fetchDonations()
      } else {
        const newDonation = { ...donation, id: donation.id || Date.now() }
        const next = [newDonation, ...donations]
        localStorage.setItem('popinfo_doacoes', JSON.stringify(next))
        setDonations(next)
      }
    } catch (error) {
      console.error('Erro ao adicionar doação:', error)
      throw error
    }
  }, [donations])

  const deleteDonation = useCallback(async (id: number) => {
    try {
      if (isSupabaseEnabled() && supabase) {
        const { error, count } = await supabase
          .from('donations')
          .delete({ count: 'exact' })
          .eq('id', id)

        if (error) {
          console.error('Supabase delete error:', error)
          throw new Error(error.message)
        }

        if (count === 0) {
          throw new Error('Nenhum registro foi excluído. Verifique se você tem permissão ou se o item já foi removido.')
        }

        await fetchDonations()
      } else {
        const updated = donations.filter(d => d.id !== id)
        localStorage.setItem('popinfo_doacoes', JSON.stringify(updated))
        setDonations(updated)
      }
    } catch (error) {
      console.error('Erro ao excluir doação:', error)
      throw error
    }
  }, [donations])

  const searchDonations = useCallback((query: string) => {
    if (!query) return donations
    const q = query.toLowerCase()
    return donations.filter(d => 
      d.titulo.toLowerCase().includes(q) ||
      d.descricao.toLowerCase().includes(q) ||
      d.categoria.toLowerCase().includes(q) ||
      (d.local && d.local.toLowerCase().includes(q)) ||
      d.address.toLowerCase().includes(q) ||
      d.neighborhood.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q)
    )
  }, [donations])

  const value = useMemo(() => ({
    donations,
    addDonation,
    deleteDonation,
    searchDonations,
    isLoading
  }), [donations, addDonation, deleteDonation, searchDonations, isLoading])

  return (
    <DonationContext.Provider value={value}>
      {children}
    </DonationContext.Provider>
  )
}

export const useDonations = () => {
  const context = useContext(DonationContext)
  if (context === undefined) {
    throw new Error('useDonations must be used within a DonationProvider')
  }
  return context
}
