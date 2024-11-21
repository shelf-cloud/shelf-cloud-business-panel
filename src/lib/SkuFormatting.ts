export const CleanSpecialCharacters = (stringToClean: string) => {
    const cleanString = stringToClean.replace(/[\-\,\'\(\)\/\s\.\:\;\=]/g, '')
    return cleanString
}

export const CleanStatus = (stringToClean: string) => {
    const cleanString = stringToClean.replace(/[\-\,\(\)\/\s\.\:\;\=\_]/g, ' ')
    return cleanString
}

