import { useState, useCallback } from 'react'
import { toast } from 'react-toastify'

export type SimpleInputModal = {
  id: string
  text: string
}

type UseInputModalProps<SimpleInputModal> = {
  onSubmit: (value: SimpleInputModal) => Promise<void> | void
  initialValue: SimpleInputModal
  validate?: (value: SimpleInputModal) => boolean | string
}

export const useInputModal = <SimpleInputModal>({ onSubmit, initialValue, validate }: UseInputModalProps<SimpleInputModal>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState<SimpleInputModal>(initialValue)

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const setValuesAndOpen = useCallback(
    (newValue: SimpleInputModal) => {
      setValue(newValue)
      setIsOpen(true)
    },
    [setValue]
  )

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setValue(initialValue) // Reset value when closing
  }, [initialValue])

  const handleSubmit = useCallback(
    async (submitValue: SimpleInputModal) => {
      try {
        setIsLoading(true)
        if (validate) {
          const validationResult = validate(submitValue)
          if (validationResult !== true) {
            toast.error(validationResult)
            return
          }
        }
        await onSubmit(submitValue)
        closeModal()
      } catch (error) {
        console.error('Error in modal submission:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [onSubmit, closeModal, validate]
  )

  return {
    isOpen,
    isLoading,
    value,
    setValuesAndOpen,
    setValue,
    openModal,
    closeModal,
    handleSubmit,
  }
}
