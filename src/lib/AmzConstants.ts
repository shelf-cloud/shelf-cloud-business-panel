export const AMAZON_MARKETPLACES_ID = ['A2EUQ1WTGCTBG2', 'ATVPDKIKX0DER', 'A1AM78C64UM0Y8', 'A2Q3Y263D00KWC', 'A1RKKUPIHCS9HS', 'A1F83G8C2ARO7P', 'A13V1IB3VIYZZH', 'AMEN7PMS3EDWL', 'A1805IZSGTT6HS', 'A1PA6795UKMFR9', 'APJ6JRA9NG5V4', 'A2NODRKZP88ZB9', 'AE08WJ6YKNBMC', 'A1C3SOZRARQ6R3', 'ARBP9OOSHTCHU', 'A33AVAJ2PDY3EV', 'A17E79C6D8DWNP', 'A2VIGQ35RCS4UG', 'A21TJRUUN4KGV', 'A19VAU5U5O7RUS', 'A39IBJ37TRP1C6', 'A1VC38T7YXB528']

type AmazonMarketplace = {
    [key: string]: {
        marketplace: string
        storeId: string
        name: string
        domain?: string
        countryCode: string
        currency: string
    }
}
export const notSupportedMarketplacesForFBA = ['A1AM78C64UM0Y8', 'A2Q3Y263D00KWC', 'A1C3SOZRARQ6R3', 'ARBP9OOSHTCHU', 'A33AVAJ2PDY3EV', 'A17E79C6D8DWNP', 'A2VIGQ35RCS4UG', 'A21TJRUUN4KGV']

export const Label_Prep_Owner_Options = [
    { value: 'NONE', label: 'NONE' },
    { value: 'SELLER', label: 'SELLER' },
    { value: 'AMAZON', label: 'AMAZON' }
];

export const AMAZON_MARKETPLACES = {
    'A2EUQ1WTGCTBG2': {
        marketplace: 'A2EUQ1WTGCTBG2',
        storeId: 'A2EUQ1WTGCTBG2',
        name: 'Amazon FBA Canada',
        domain: 'Amazon.ca',
        countryCode: 'CA',
        currency: 'CAD'
    },
    'ATVPDKIKX0DER': {
        marketplace: 'ATVPDKIKX0DER',
        storeId: 'ATVPDKIKX0DER',
        name: 'Amazon FBA USA',
        domain: 'Amazon.com',
        countryCode: 'US',
        currency: 'USD'
    },
    'A1AM78C64UM0Y8': {
        marketplace: 'A1AM78C64UM0Y8',
        storeId: 'A1AM78C64UM0Y8',
        name: 'Amazon FBA Mexico',
        domain: 'Amazon.com.mx',
        countryCode: 'MX',
        currency: 'MXN'
    },
    'A2Q3Y263D00KWC': {
        marketplace: 'A2Q3Y263D00KWC',
        storeId: 'A2Q3Y263D00KWC',
        name: 'Amazon FBA Brazil',
        domain: 'Amazon.com.br',
        countryCode: 'BR',
        currency: 'BRL'
    },
    'A1RKKUPIHCS9HS': {
        marketplace: 'A1RKKUPIHCS9HS',
        storeId: 'A1RKKUPIHCS9HS',
        name: 'Amazon FBA Spain',
        domain: 'Amazon.es',
        countryCode: 'ES',
        currency: 'EUR'
    },
    'A1F83G8C2ARO7P': {
        marketplace: 'A1F83G8C2ARO7P',
        storeId: 'A1F83G8C2ARO7P',
        name: 'Amazon FBA UK',
        domain: 'Amazon.co.uk',
        countryCode: 'GB',
        currency: 'GBP'
    },
    'A13V1IB3VIYZZH': {
        marketplace: 'A13V1IB3VIYZZH',
        storeId: 'A13V1IB3VIYZZH',
        name: 'Amazon FBA France',
        domain: 'Amazon.fr',
        countryCode: 'FR',
        currency: 'EUR'
    },
    'AMEN7PMS3EDWL': {
        marketplace: 'AMEN7PMS3EDWL',
        storeId: 'AMEN7PMS3EDWL',
        name: 'Amazon FBA Belgium',
        domain: 'Amazon.be',
        countryCode: 'BE',
        currency: 'EUR'
    },
    'A1805IZSGTT6HS': {
        marketplace: 'A1805IZSGTT6HS',
        storeId: 'A1805IZSGTT6HS',
        name: 'Amazon FBA Netherlands',
        domain: 'Amazon.nl',
        countryCode: 'NL',
        currency: 'EUR'
    },
    'A1PA6795UKMFR9': {
        marketplace: 'A1PA6795UKMFR9',
        storeId: 'A1PA6795UKMFR9',
        name: 'Amazon FBA Germany',
        domain: 'Amazon.de',
        countryCode: 'DE',
        currency: 'EUR'
    },
    'APJ6JRA9NG5V4': {
        marketplace: 'APJ6JRA9NG5V4',
        storeId: 'APJ6JRA9NG5V4',
        name: 'Amazon FBA Italy',
        domain: 'Amazon.it',
        countryCode: 'IT',
        currency: 'EUR'
    },
    'A2NODRKZP88ZB9': {
        marketplace: 'A2NODRKZP88ZB9',
        storeId: 'A2NODRKZP88ZB9',
        name: 'Amazon FBA Sweden',
        domain: 'Amazon.se',
        countryCode: 'SE',
        currency: 'SEK'
    },
    'AE08WJ6YKNBMC': {
        marketplace: 'AE08WJ6YKNBMC',
        storeId: 'AE08WJ6YKNBMC',
        name: 'Amazon FBA South Africa',
        countryCode: 'ZA',
        currency: 'ZAR'
    },
    'A1C3SOZRARQ6R3': {
        marketplace: 'A1C3SOZRARQ6R3',
        storeId: 'A1C3SOZRARQ6R3',
        name: 'Amazon FBA Poland',
        domain: 'Amazon.pl',
        countryCode: 'PL',
        currency: 'PLN'
    },
    'ARBP9OOSHTCHU': {
        marketplace: 'ARBP9OOSHTCHU',
        storeId: 'ARBP9OOSHTCHU',
        name: 'Amazon FBA Egypt',
        domain: 'Amazon.eg',
        countryCode: 'EG',
        currency: 'EGP'
    },
    'A33AVAJ2PDY3EV': {
        marketplace: 'A33AVAJ2PDY3EV',
        storeId: 'A33AVAJ2PDY3EV',
        name: 'Amazon FBA Turkey',
        domain: 'Amazon.tr',
        countryCode: 'TR',
        currency: 'TRY'
    },
    'A17E79C6D8DWNP': {
        marketplace: 'A17E79C6D8DWNP',
        storeId: 'A17E79C6D8DWNP',
        name: 'Amazon FBA Saudi Arabia',
        domain: 'Amazon.sa',
        countryCode: 'SA',
        currency: 'SAR'
    },
    'A2VIGQ35RCS4UG': {
        marketplace: 'A2VIGQ35RCS4UG',
        storeId: 'A2VIGQ35RCS4UG',
        name: 'Amazon FBA UAE',
        domain: 'Amazon.ae',
        countryCode: 'AE',
        currency: 'AED'
    },
    'A21TJRUUN4KGV': {
        marketplace: 'A21TJRUUN4KGV',
        storeId: 'A21TJRUUN4KGV',
        name: 'Amazon FBA India',
        domain: 'Amazon.in',
        countryCode: 'IN',
        currency: 'INR'
    },
    'A19VAU5U5O7RUS': {
        marketplace: 'A19VAU5U5O7RUS',
        storeId: 'A19VAU5U5O7RUS',
        name: 'Amazon FBA Singapore',
        countryCode: 'SG',
        currency: 'SGD'
    },
    'A39IBJ37TRP1C6': {
        marketplace: 'A39IBJ37TRP1C6',
        storeId: 'A39IBJ37TRP1C6',
        name: 'Amazon FBA Australia',
        countryCode: 'AU',
        currency: 'AUD'
    },
    'A1VC38T7YXB528': {
        marketplace: 'A1VC38T7YXB528',
        storeId: 'A1VC38T7YXB528',
        name: 'Amazon FBA Japan',
        domain: 'Amazon.co.jp',
        countryCode: 'JP',
        currency: 'JPY'
    },
} as AmazonMarketplace

export const AMAZON_MARKETPLACES_BY_DOMAIN = {
    'Amazon.ca': 'A2EUQ1WTGCTBG2',
    'Amazon.com': 'ATVPDKIKX0DER',
    'Amazon.com.mx': 'A1AM78C64UM0Y8',
    'Amazon.com.br': 'A2Q3Y263D00KWC',
    'Amazon.es': 'A1RKKUPIHCS9HS',
    'Amazon.co.uk': 'A1F83G8C2ARO7P',
    'Amazon.fr': 'A13V1IB3VIYZZH',
    'Amazon.be': 'AMEN7PMS3EDWL',
    'Amazon.nl': 'A1805IZSGTT6HS',
    'Amazon.de': 'A1PA6795UKMFR9',
    'Amazon.it': 'APJ6JRA9NG5V4',
    'Amazon.se': 'A2NODRKZP88ZB9',
    'Amazon.ae': 'A2VIGQ35RCS4UG',
    'Amazon.pl': 'A1C3SOZRARQ6R3',
    'Amazon.eg': 'ARBP9OOSHTCHU',
    'Amazon.tr': 'A33AVAJ2PDY3EV',
    'Amazon.sa': 'A17E79C6D8DWNP',
    'Amazon.in': 'A21TJRUUN4KGV',
    'Amazon.sg': 'A19VAU5U5O7RUS',
    'Amazon.au': 'A39IBJ37TRP1C6',
    'Amazon.co.jp': 'A1VC38T7YXB528',
} as { [key: string]: string }