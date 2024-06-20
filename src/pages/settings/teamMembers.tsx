import BreadCrumb from '@components/Common/BreadCrumb'
import { GetServerSideProps } from 'next'
import { getSession } from '@auth/client'
import Head from 'next/head'
import React, { useContext, useMemo, useState } from 'react'
import { Button, Card, CardBody, Container } from 'reactstrap'
import { ManageUser, TeamMember } from '@typesTs/settings/team_members'
import axios from 'axios'
import useSWR from 'swr'
import AppContext from '@context/AppContext'
import { DebounceInput } from 'react-debounce-input'
import ManageTeamMemberModal from '@components/modals/settings/ManageTeamMemberModal'
import TeamMembersTable from '@components/settings/team_members/TeamMembersTable'
import CreateNewTeamMemberModal from '@components/modals/settings/CreateNewTeamMemberModal'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionToken = context.req.cookies['next-auth.session-token'] ? context.req.cookies['next-auth.session-token'] : context.req.cookies['__Secure-next-auth.session-token']
  const session = await getSession(context)
  if (session == null) {
    return {
      redirect: {
        destination: '/SignIn',
        permanent: false,
      },
    }
  }
  if (session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  return {
    props: { session, sessionToken },
  }
}

type Props = {}

const TeamMembers = ({}: Props) => {
  const { state }: any = useContext(AppContext)

  const [searchValue, setSearchValue] = useState<any>('')
  const [manageUser, setManageUser] = useState<ManageUser>({
    userId: 0,
    businessId: '',
    role: '',
    name: '',
    username: '',
    email: '',
    dateAdded: '',
    lastActive: '',
    permissions: {},
  })
  const [showModal, setShowModal] = useState(false)
  const [showNewMemberModal, setShowNewMemberModal] = useState(false)

  const fetcherMarketplaces = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data: Members }: { data?: TeamMember[] } = useSWR(
    state.user.businessId ? `/api/settings/teamMembers/getTeamMembers?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcherMarketplaces
  )

  const filterTeamMembers = useMemo(() => {
    if (!Members) return []

    if (searchValue === '') return Members

    const search = searchValue.toLowerCase()

    return Members.filter((member) => member.name.toLowerCase().includes(search) || member.email.toLowerCase() === search)
  }, [Members, searchValue])

  const handleManageUser = (user: TeamMember) => {
    setManageUser(user)
    setShowModal(true)
  }

  return (
    <div>
      <Head>
        <title>Team Members</title>
      </Head>

      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Team Members' pageTitle='Settings' />
            <Card className=''>
              <CardBody className='p-4'>
                <div className='d-flex flex-sm-column justify-content-between align-items-center p-0 flex-xl-row gap-sm-2 gap-xl-0'>
                  <div className='d-flex flex-wrap justify-content-start align-items-center gap-3 w-100'>
                    {Members?.length! < 3 && <Button onClick={() => setShowNewMemberModal(true)}>+ Add Member</Button>}
                  </div>
                  <div className='app-search col-sm-12 col-xl-3 p-0'>
                    <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                      <DebounceInput
                        type='text'
                        minLength={3}
                        debounceTimeout={500}
                        className='form-control bg-white'
                        placeholder='Search...'
                        id='search-options'
                        value={searchValue}
                        onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                      <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                      <span
                        className='d-flex align-items-center justify-content-center bg-white'
                        style={{
                          cursor: 'pointer',
                        }}
                        onClick={() => setSearchValue('')}>
                        <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                      </span>
                    </div>
                  </div>
                </div>
                <TeamMembersTable teamMembers={filterTeamMembers} handleManageUser={handleManageUser} pending={Members ? false : true}/>
              </CardBody>
            </Card>
          </Container>
        </div>
        {showModal && <ManageTeamMemberModal manageUser={manageUser} setManageUser={setManageUser} showModal={showModal} setShowModal={setShowModal} />}
        {showNewMemberModal && <CreateNewTeamMemberModal showModal={showNewMemberModal} setShowModal={setShowNewMemberModal} />}
      </React.Fragment>
    </div>
  )
}

export default TeamMembers
