type ClassValue = string | number | null | undefined | false | ClassValue[]

/** รวม className แบบสั้น ๆ โดยตัดค่าที่เป็น falsy ทิ้ง */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  for (const input of inputs) {
    if (!input) continue
    if (Array.isArray(input)) {
      const nested = cn(...input)
      if (nested) out.push(nested)
    } else {
      out.push(String(input))
    }
  }
  return out.join(' ')
}
