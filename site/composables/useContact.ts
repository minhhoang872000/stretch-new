export const useContact = () => {
  const isOpen = useState('contact-is-open', () => false)
  
  const toggleContact = () => {
    isOpen.value = !isOpen.value
  }
  
  const openContact = () => {
    isOpen.value = true
  }
  
  const closeContact = () => {
    isOpen.value = false
  }
  
  return {
    isOpen,
    toggleContact,
    openContact,
    closeContact
  }
}
