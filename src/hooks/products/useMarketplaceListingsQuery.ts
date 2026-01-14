import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs'

export const useMarketplaceListingsQueries = () => {
  const [listingsFilter, setListingsFilter] = useQueryStates({
    marketplace: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
    filters: parseAsString.withDefault('false').withOptions({ clearOnDefault: true }),
    showHidden: parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
    supplier: parseAsString.withDefault('All').withOptions({ clearOnDefault: true }),
    brand: parseAsString.withDefault('All').withOptions({ clearOnDefault: true }),
    category: parseAsString.withDefault('All').withOptions({ clearOnDefault: true }),
  })

  return { listingsFilter, setListingsFilter }
}
