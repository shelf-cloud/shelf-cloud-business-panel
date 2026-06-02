import { GetServerSideProps } from 'next'

import { getSession } from '@auth/client'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (session == null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }

  const query = new URLSearchParams({
    brand: String(context.query.brand || 'All'),
    supplier: String(context.query.supplier || 'All'),
    category: String(context.query.category || 'All'),
    condition: String(context.query.condition || 'All'),
    status: 'Inactive',
  })

  return {
    redirect: {
      destination: `/Products?${query.toString()}`,
      permanent: false,
    },
  }
}

const InactiveProducts = () => null

export default InactiveProducts
