import { TeamMember } from '@typesTs/settings/team_members'
import moment from 'moment'
import DataTable from '@components/Common/DataTableSC'
import { Button } from '@shadcn/ui/button'

type Props = {
  teamMembers: TeamMember[]
  handleManageUser: (user: TeamMember) => void
  pending: boolean
}

const TeamMembersTable = ({ teamMembers, handleManageUser, pending }: Props) => {
  const columns: any = [
    {
      name: <span className='font-bold text-[13px]'>Name</span>,
      selector: (row: TeamMember) => {
        return (
          <>
            <p className='m-0 p-0'>{row.name}</p>
            <p className='m-0 p-0 text-muted-foreground text-[11.2px]'>{row.email}</p>
          </>
        )
      },
      sortable: true,
      center: false,
    },
    {
      name: <span className='font-bold text-[13px]'>Role</span>,
      selector: (row: TeamMember) => row.role,
      sortable: true,
      center: true,
      style: {
        fontSize: '0.7rem',
        textTransform: 'capitalize',
      },
    },
    {
      name: <span className='font-bold text-[13px]'>Date Added</span>,
      selector: (row: TeamMember) => row.dateAdded,
      sortable: true,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-bold text-[13px]'>Last Activity</span>,
      selector: (row: TeamMember) => (row.lastActive ? moment(row.lastActive).format('YYYY-MM-DD, h:mm:ss a') : 'No Activity'),
      sortable: true,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-bold text-[13px]'></span>,
      selector: (row: TeamMember) => {
        return (
          <Button variant='light' className='text-[11.2px]' onClick={() => handleManageUser(JSON.parse(JSON.stringify(row)))}>
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
