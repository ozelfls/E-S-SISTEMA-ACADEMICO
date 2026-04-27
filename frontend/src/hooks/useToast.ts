export function useToast() {
  const showError = (message: string) => {
    window.alert(message)
  }

  const showSuccess = (message: string) => {
    window.alert(message)
  }

  return { showError, showSuccess }
}
