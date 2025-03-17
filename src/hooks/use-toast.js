// Simplified version of the toast hook
export function useToast() {
    return {
      toast: ({ title, description, variant }) => {
        console.log({ title, description, variant })
      },
    }
  }
  
  