export const CleanSpecialCharacters = (stringToClean: string) => {
    const cleanString = stringToClean.replace(/[\-\,\(\)\/\s\.\:\;\=]/g, '')
    return cleanString
}