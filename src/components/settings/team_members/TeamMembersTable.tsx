import { TeamMember } from '@typesTs/settings/team_members'
import moment from 'moment'
import React from 'react'
import DataTable from 'react-data-table-component'
import { Button } from 'reactstrap'

type Props = {
    teamMembers: TeamMember[]
    handleManageUser: (user: TeamMember) => void
}

const TeamMembersTable = ({teamMembers, handleManageUser}: Props) => {
  const columns: any = [
    {
      name: <span className='font-weight-bold fs-13'>Name</span>,
      selector: (row: TeamMember) => {
        return (
          <>
            <p className='m-0 p-0'>{row.name}</p>
            <p className='m-0 p-0 text-muted'>{row.email}</p>
          </>
        )
      },
      sortable: true,
      center: false,
    },
    {
      name: <span className='font-weight-bold fs-13'>Role</span>,
      selector: (row: TeamMember) => row.role,
      sortable: true,
      center: true,
      style: {
        textTransform: 'capitalize',
      },
    },
    {
      name: <span className='font-weight-bold fs-13'>Date Added</span>,
      selector: (row: TeamMember) => row.dateAdded,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-weight-bold fs-13'>Last Activity</span>,
      selector: (row: TeamMember) => row.lastActive ? moment(row.lastActive).format('YYYY-MM-DD, h:mm:ss a') : 'No Activity',
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-weight-bold fs-13'></span>,
      selector: (row: TeamMember) => {
        return (
          <Button color='light' onClick={() => handleManageUser(JSON.parse(JSON.stringify(row)))}>
            Manage
          </Button>
        )
      },
      sortable: true,
      center: true,
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={teamMembers} progressPending={teamMembers ? false : true} defaultSortFieldId={1} />
    </>
  )
}

export default TeamMembersTable
