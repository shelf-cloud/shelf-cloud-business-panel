import { useContext, useState } from 'react'

import CategoryTeamMembersHeader from '@components/settings/team_members/CategoryTeamMembersHeader'
import AppContext from '@context/AppContext'
import { ManageUser, Modules } from '@typesTs/settings/team_members'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Label } from '@shadcn/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'
import useSWR from 'swr'

type Props = {
  manageUser: ManageUser
  setManageUser: (userManage: ManageUser) => void
  showModal: boolean
  setShowModal: (showModal: boolean) => void
}

function ManageTeamMemberModal({ manageUser, setManageUser, showModal, setShowModal }: Props) {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [loadingModules, setLoadingModules] = useState(true)

  const fecthModules = (endPoint: string) => {
    setLoadingModules(true)
    const modules = axios(endPoint).then((res) => {
      setLoadingModules(false)
      return res.data
    })
    return modules
  }
  const { data: modules }: { data?: Modules } = useSWR(
    state.user.businessId ? `/api/settings/teamMembers/getModules?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fecthModules,
    {
      revalidateOnFocus: false,
    }
  )
  const handleChangePermissions = (module: string, subModule: string) => {
    const newPermissions = { ...manageUser.permissions }

    if (newPermissions[module].modules[subModule].view) {
      newPermissions[module].modules[subModule].view = false
      if (Object.values(newPermissions[module].modules).every((module) => module.view === false)) newPermissions[module].view = false
      setManageUser({ ...manageUser, permissions: newPermissions })
    } else {
      newPermissions[module].modules[subModule].view = true
      newPermissions[module].view = true
      setManageUser({ ...manageUser, permissions: newPermissions })
    }
  }
  const saveManageUserChanges = async () => {
    setLoading(true)

    const response = await axios.post(`/api/settings/teamMembers/saveTeamMember?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      user: manageUser,
    })

    if (!response.data.error) {
      toast.success('User permissions updated')
      mutate(`/api/settings/teamMembers/getTeamMembers?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      setShowModal(false)
      setManageUser({
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
    } else {
      toast.error('Error updating user permissions')
    }
    setLoading(false)
  }

  const handleResetPasswordTeamMember = async () => {
    setLoading(true)

    const response = await axios.post(`/api/settings/teamMembers/resetPasswordTeamMember?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      userId: manageUser.userId,
      email: manageUser.email,
    })

    if (!response.data.error) {
      toast.success(response.data.message)
      mutate(`/api/settings/teamMembers/getTeamMembers?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      setShowModal(false)
      setManageUser({
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
    } else {
      toast.error(response.data.message)
    }
    setLoading(false)
  }

  const handleDeleteTeamMember = async () => {
    setLoading(true)

    const response = await axios.post(`/api/settings/teamMembers/deleteTeamMember?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      userId: manageUser.userId,
    })

    if (!response.data.error) {
      toast.success(response.data.message)
      mutate(`/api/settings/teamMembers/getTeamMembers?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      setShowModal(false)
      setManageUser({
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
    } else {
      toast.error(response.data.message)
    }
    setLoading(false)
  }

  return (
    <Dialog
      open={!!showModal}
      onOpenChange={(open) => {
        if (!open) {
          setShowModal(false)
          setManageUser({
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
        }
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl' id='unitsSoldDetailsModal'>
        <DialogHeader className='pr-6'>
          <p className='m-0 p-0 mb-1 font-bold text-[16.25px]'>{manageUser.name}</p>
          <p className='m-0 p-0 font-normal text-[13px]'>{manageUser.email}</p>
        </DialogHeader>
        <div className='pb-0'>
          {!loadingModules ? (
            Object.entries(modules!).map(([module, moduleInfo]) => (
              <div className='flex flex-wrap -mx-3 mb-4' key={module}>
                <CategoryTeamMembersHeader
                  title={module}
                  icon={moduleInfo.icon}
                  checked={manageUser.permissions[module].view ?? false}
                  manageUser={manageUser}
                  setManageUser={setManageUser}
                />
                <div className='flex flex-wrap -mx-3 px-6 py-4 gap-4'>
                  {moduleInfo.modules?.map((subModule) => (
                    <div className='px-3 flex-1 basis-0' key={subModule}>
                      <div className='flex flex-row justify-start items-end w-fit gap-2'>
                        <Label className='form-check-label text-nowrap font-normal'>{subModule}</Label>
                        <div className='form-check-info'>
                          <input
                            className='size-4 shrink-0 border border-input-border accent-primary rounded-sm'
                            type='checkbox'
                            checked={manageUser.permissions[module].modules[subModule].view ?? false}
                            onChange={() => handleChangePermissions(module, subModule)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <>
              <span className='font-normal text-[16.25px] me-4'>Loading Modules...</span>
              <Spinner className='text-primary' />
            </>
          )}
        </div>
        {!loadingModules && (
          <DialogFooter className='items-center flex flex-row justify-between items-center gap-2'>
            <div className='flex flex-row gap-4'>
              <Button variant='destructive' disabled={loading} onClick={handleDeleteTeamMember}>
                Delete User
              </Button>
              <Button variant='info' disabled={loading} onClick={handleResetPasswordTeamMember}>
                Reset Password
              </Button>
            </div>
            <div className='flex flex-row gap-4'>
              <Button
                variant='light'
                onClick={() => {
                  setShowModal(false)
                  setManageUser({
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
                }}>
                Close
              </Button>
              <Button disabled={loading} type='submit' variant='success' onClick={saveManageUserChanges}>
                {loading ? <Spinner className='text-white' /> : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ManageTeamMemberModal
