export const sortStringsLocaleCompare = (a: string, b: string) => {
  if (a.localeCompare(b)) {
    return 1
  } else {
    return -1
  }
}

export const sortStringsCaseInsensitive = (string1: string, string2: string) => {
  const a = string1.toLowerCase()
  const b = string2.toLowerCase()
  if (a > b) {
    return 1
  }
  if (b > a) {
    return -1
  }
  return 0
}

export const sortNumbers = (a: number, b: number) => {
  if (a > b) {
    return 1
  }
  if (b > a) {
    return -1
  }
  return 0
}
