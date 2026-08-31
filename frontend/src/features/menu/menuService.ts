import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'

export type MenuCategory = Tables<'menu_categories'>
export type MenuItem = Tables<'menu_items'>
export type BuffetPackage = Tables<'buffet_packages'>

export interface MenuSection {
  category: MenuCategory
  items: MenuItem[]
}

export const menuService = {
  async listPackages(): Promise<BuffetPackage[]> {
    const { data, error } = await supabase
      .from('buffet_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw error
    return data
  },

  /** เมนูจัดกลุ่มตามหมวดพร้อมใช้งานใน UI — หมวดที่ไม่มีเมนูจะถูกตัดทิ้ง */
  async listMenu(options: { availableOnly?: boolean } = {}): Promise<MenuSection[]> {
    const [categories, items] = await Promise.all([
      supabase.from('menu_categories').select('*').eq('is_active', true).order('sort_order'),
      options.availableOnly === false
        ? supabase.from('menu_items').select('*').order('sort_order')
        : supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order'),
    ])
    if (categories.error) throw categories.error
    if (items.error) throw items.error

    return categories.data
      .map((category) => ({
        category,
        items: items.data.filter((item) => item.category_id === category.id),
      }))
      .filter((section) => section.items.length > 0)
  },

  async listAllItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase.from('menu_items').select('*').order('sort_order')
    if (error) throw error
    return data
  },

  async createItem(payload: TablesInsert<'menu_items'>) {
    const { data, error } = await supabase.from('menu_items').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async updateItem(id: string, payload: TablesUpdate<'menu_items'>) {
    const { data, error } = await supabase
      .from('menu_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  toggleAvailability: (id: string, isAvailable: boolean) =>
    menuService.updateItem(id, { is_available: isAvailable }),
}
