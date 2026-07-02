import { useContext, useState } from 'react'

import CategoryTeamMembersHeader from '@components/settings/team_members/CategoryTeamMembersHeader'
import AppContext from '@context/AppContext'
import { ManageUser, Modules } from '@typesTs/settings/team_members'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from '@/components/migration-ui'
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
    <Modal
      fade={false}
      size='lg'
      id='unitsSoldDetailsModal'
      isOpen={showModal}
      toggle={() => {
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
      <ModalHeader
        toggle={() => {
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
        <p className='m-0 p-0 mb-1 font-bold text-[16.25px]'>{manageUser.name}</p>
        <p className='m-0 p-0 font-normal text-[13px]'>{manageUser.email}</p>
      </ModalHeader>
      <ModalBody className='pb-0'>
        {!loadingModules ? (
          Object.entries(modules!).map(([module, moduleInfo]) => (
            <Row className='mb-4' key={module}>
              <CategoryTeamMembersHeader
                title={module}
                icon={moduleInfo.icon}
                checked={manageUser.permissions[module].view ?? false}
                manageUser={manageUser}
                setManageUser={setManageUser}
              />
              <Row className='px-6 py-4 gap-4'>
                {moduleInfo.modules?.map((subModule) => (
                  <Col key={subModule}>
                    <div className='flex flex-row justify-start items-end w-fit gap-2'>
                      <Label className='form-check-label text-nowrap font-normal'>{subModule}</Label>
                      <div className='form-check-info'>
                        <Input
                          className='form-check-input'
                          type='checkbox'
                          checked={manageUser.permissions[module].modules[subModule].view ?? false}
                          onChange={() => handleChangePermissions(module, subModule)}
                        />
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Row>
          ))
        ) : (
          <>
            <span className='font-normal text-[16.25px] me-4'>Loading Modules...</span>
            <Spinner color='primary' size='sm' />
          </>
        )}
      </ModalBody>
      {!loadingModules && (
        <ModalFooter className='flex flex-row justify-between items-center gap-2'>
          <div className='flex flex-row gap-4'>
            <Button color='danger' disabled={loading} onClick={handleDeleteTeamMember}>
              Delete User
            </Button>
            <Button color='info' disabled={loading} onClick={handleResetPasswordTeamMember}>
              Reset Password
            </Button>
          </div>
          <div className='flex flex-row gap-4'>
            <Button
              color='light'
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
            <Button disabled={loading} type='submit' color='success' onClick={saveManageUserChanges}>
              {loading ? <Spinner color='light' size={'sm'} /> : 'Save Changes'}
            </Button>
          </div>
        </ModalFooter>
      )}
    </Modal>
  )
}

export default ManageTeamMemberModal
