import { TeamMember } from '@typesTs/settings/team_members'
import moment from 'moment'
import DataTable from 'react-data-table-component'
import { Button } from 'reactstrap'

type Props = {
  teamMembers: TeamMember[]
  handleManageUser: (user: TeamMember) => void
  pending: boolean
}

const TeamMembersTable = ({ teamMembers, handleManageUser, pending }: Props) => {
  const columns: any = [
    {
      name: <span className='fw-bold fs-6'>Name</span>,
      selector: (row: TeamMember) => {
        return (
          <>
            <p className='m-0 p-0'>{row.name}</p>
            <p className='m-0 p-0 text-muted fs-7'>{row.email}</p>
          </>
        )
      },
      sortable: true,
      center: false,
    },
    {
      name: <span className='fw-bold fs-6'>Role</span>,
      selector: (row: TeamMember) => row.role,
      sortable: true,
      center: true,
      style: {
        fontSize: '0.7rem',
        textTransform: 'capitalize',
      },
    },
    {
      name: <span className='fw-bold fs-6'>Date Added</span>,
      selector: (row: TeamMember) => row.dateAdded,
      sortable: true,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bold fs-6'>Last Activity</span>,
      selector: (row: TeamMember) => (row.lastActive ? moment(row.lastActive).format('YYYY-MM-DD, h:mm:ss a') : 'No Activity'),
      sortable: true,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bold fs-6'></span>,
      selector: (row: TeamMember) => {
        return (
          <Button color='light' className='fs-7' onClick={() => handleManageUser(JSON.parse(JSON.stringify(row)))}>
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
      <DataTable columns={columns} data={teamMembers} progressPending={pending} defaultSortFieldId={1} />
    </>
  )
}

export default TeamMembersTable
