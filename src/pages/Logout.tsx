import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  return {
    redirect: {
      destination: '/api/auth/signin',
      permanent: false,
    },
  }
}

const Logout = () => {
  return (
    <div>
      <div className="page-content"></div>
    </div>
  )
}

export default Logout
