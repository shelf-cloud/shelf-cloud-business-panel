import { CONTEXT, DATA_STRUCTURE_DESCRIPTION, SYSTEM_PROMPT } from './constants'

export type BusinessPromptResponse = {
  error: boolean
  message?: string
  prompt: BusinessPrompt | null
}

export interface BusinessPrompt {
  general: string
  objective: string
  corerules: string
  restrictions: string
  output: string
  businessrules: string
}

export const build_bsnss_system_prompt = (prompt: BusinessPrompt | null | undefined) => {
  if (!prompt) {
    return SYSTEM_PROMPT
  }

  let bsnssSystemPrompt = `${prompt.general}\n\n${prompt.objective}\n\n${CONTEXT}\n\n${DATA_STRUCTURE_DESCRIPTION}\n\n${prompt.corerules}\n\n`

  if (prompt.businessrules) {
    bsnssSystemPrompt += `Business Specific Rules (HARD): This rules should override general rules that conflict with them.\n${prompt.businessrules}`
  }

  bsnssSystemPrompt += `\n\n${prompt.restrictions}\n\n${prompt.output}`

  return bsnssSystemPrompt
}
