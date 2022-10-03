import { GetServerSideProps } from 'next'

// export const getServerSideProps: GetServerSideProps<{}> = async () => {
//   return {
//     redirect: {
//       destination: '/api/auth/signin',
//       permanent: true,
//     },
//   }
// }

const logout = () => {
  return (
    <div>
      <div className="page-content">
        <h1>LogOut</h1>
      </div>
    </div>
  )
}

export default logout
