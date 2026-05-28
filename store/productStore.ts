import { Property } from '../types'
import { create } from 'zustand'

interface ProductState {
    properties: Property[]
    setProperties: (properties: Property[]) => void
}

export const useProductStore = create<ProductState>((set) => {
    return {
        properties: [],
        setProperties: (properties: Property[]) => set({ properties: properties }),
    }
})
