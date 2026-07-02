import { ManageUser } from '@typesTs/settings/team_members'

import { Switch } from '@/components/migration-ui'

type Props = {
  title: string
  icon: string
  checked: boolean
  manageUser: ManageUser
  setManageUser: (userManage: ManageUser) => void
}

const CategoryTeamMembersHeader = ({ title, icon, checked, manageUser, setManageUser }: Props) => {
  const handleChangePermissions = () => {
    const newPermissions = { ...manageUser.permissions }

    if (newPermissions[title].view) {
      newPermissions[title].view = false
      Object.keys(newPermissions[title].modules).forEach((module) => {
        newPermissions[title].modules[module].view = false
      })
      setManageUser({ ...manageUser, permissions: newPermissions })
    } else {
      newPermissions[title].view = true
      Object.keys(newPermissions[title].modules).forEach((module) => {
        newPermissions[title].modules[module].view = true
      })
      setManageUser({ ...manageUser, permissions: newPermissions })
    }
  }

  return (
    <div className='tw:bg-light tw:flex tw:flex-row tw:justify-start tw:items-center tw:py-2'>
      <>
        <i className={`${icon} fs-5 m-0 p-0 me-2`} />
        <span className='tw:font-semibold tw:text-[16.25px] tw:capitalize'>{title}</span>
      </>
      <div className='form-check form-switch form-check-right form-check-success'>
        <Switch checked={checked} onChange={handleChangePermissions} />
      </div>
    </div>
  )
}

export default CategoryTeamMembersHeader
