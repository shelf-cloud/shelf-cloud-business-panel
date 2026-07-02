import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import CreateNewTeamMemberModal from '@components/modals/settings/CreateNewTeamMemberModal'
import ManageTeamMemberModal from '@components/modals/settings/ManageTeamMemberModal'
import TeamMembersTable from '@components/settings/team_members/TeamMembersTable'
import AppContext from '@context/AppContext'
import { ManageUser, TeamMember } from '@typesTs/settings/team_members'
import axios from 'axios'
import { DebounceInput } from 'react-debounce-input'
import { Button, Card, CardBody, Container } from '@/components/migration-ui'
import useSWR from 'swr'

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
          <BreadCrumb title='Team Members' pageTitle='Settings' />
          <Container fluid>
            <Card>
              <CardBody className='tw:p-6'>
                <div className='tw:flex tw:sm:flex-col tw:xl:flex-row tw:justify-between tw:items-center tw:p-0 tw:sm:gap-2 tw:xl:gap-0'>
                  <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center tw:gap-4 tw:w-full'>
                    {Members?.length! < 3 && <Button onClick={() => setShowNewMemberModal(true)}>+ Add Member</Button>}
                  </div>
                  <div className='app-search tw:w-full tw:xl:w-1/4 tw:p-0'>
                    <div className='tw:relative tw:flex tw:rounded-lg tw:w-full tw:overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                      <DebounceInput
                        type='text'
                        minLength={3}
                        debounceTimeout={500}
                        className='form-control tw:text-[13px] tw:bg-white'
                        placeholder='Search...'
                        id='search-options'
                        value={searchValue}
                        onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                      <span className='mdi mdi-magnify search-widget-icon tw:text-[16.25px]'></span>
                      <span
                        className='tw:flex tw:items-center tw:justify-center tw:bg-white'
                        style={{
                          cursor: 'pointer',
                        }}
                        onClick={() => setSearchValue('')}>
                        <i className='mdi mdi-window-close tw:text-[16.25px] tw:m-0 tw:px-2 tw:py-0 tw:text-[color:var(--bs-secondary-color)]' />
                      </span>
                    </div>
                  </div>
                </div>
                <TeamMembersTable teamMembers={filterTeamMembers} handleManageUser={handleManageUser} pending={Members ? false : true} />
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
