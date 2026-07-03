import { useContext, useState } from 'react'

import CategoryTeamMembersHeader from '@components/settings/team_members/CategoryTeamMembersHeader'
import AppContext from '@context/AppContext'
import { NewTeamMember } from '@typesTs/settings/team_members'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import useSWR, { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
}

const CreateNewTeamMemberModal = ({ showModal, setShowModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [loadingModules, setLoadingModules] = useState(true)
  const [manageUser, setManageUser] = useState<NewTeamMember>({
    name: '',
    email: '',
    permissions: {},
  })
  const [formError, setformError] = useState('')

  const fecthModules = (endPoint: string) => {
    setLoadingModules(true)
    const modules = axios(endPoint).then((res) => {
      setLoadingModules(false)
      setManageUser((prev) => {
        return {
          ...prev,
          permissions: res.data,
        }
      })
    })
    return modules
  }
  useSWR(state.user.businessId ? `/api/settings/teamMembers/getModulesForNewMember?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fecthModules, {
    revalidateOnFocus: false,
  })

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: '',
      email: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().max(80, 'Name is to Long').required('Please enter member name'),
      email: Yup.string().email().required('Please enter email address'),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      const hasError = Object.values(manageUser.permissions).every((module) => {
        if (module.view) return false
        if (Object.values(module.modules).every((subModule) => !subModule.view)) return true
      })
      if (hasError) {
        setformError('*Must select at least one module access permission for the user')
        setLoading(false)
        return
      }

      const response = await axios.post(`/api/settings/teamMembers/createNewTeamMember?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        newTeamMember: { ...values, permissions: manageUser.permissions },
      })

      if (!response.data.error) {
        toast.success(response.data.message)
        mutate(`/api/settings/teamMembers/getTeamMembers?region=${state.currentRegion}&businessId=${state.user.businessId}`)
        setShowModal(false)
      } else {
        toast.error(response.data.message)
      }
      setLoading(false)
    },
  })

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

  const handleCreateNewTeamMember = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Dialog open={!!showModal} onOpenChange={(open) => { if (!open) setShowModal(false) }}>
      <DialogContent id='unitsSoldDetailsModal' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl'>
      <DialogHeader className='pr-6'>
        <p className='m-0 p-0 mb-1 font-bold text-[22.75px]'>Create New Team Member</p>
      </DialogHeader>
      <form onSubmit={handleCreateNewTeamMember}>
        <div className='pb-0'>
          {!loadingModules ? (
            <>
              <div className='flex flex-wrap -mx-3'>
                <div className='px-3 lg:w-6/12'>
                  <div className='mb-4'>
                    <Label htmlFor='name' className='form-label'>
                      *Name
                    </Label>
                    <Input
                      type='text'
                      placeholder='Name'
                      id='name'
                      name='name'
                      className='h-8 text-xs'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.name || ''}
                      aria-invalid={(validation.touched.name && validation.errors.name ? true : false) || undefined}
                    />
                    {validation.touched.name && validation.errors.name ? <div className='text-sm text-destructive'>{validation.errors.name}</div> : null}
                  </div>
                </div>
                <div className='px-3 lg:w-6/12'>
                  <div className='mb-4'>
                    <Label htmlFor='email' className='form-label'>
                      *Email Address
                    </Label>
                    <Input
                      type='text'
                      placeholder='Email Address'
                      id='email'
                      name='email'
                      className='h-8 text-xs'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.email || ''}
                      aria-invalid={(validation.touched.email && validation.errors.email ? true : false) || undefined}
                    />
                    {validation.touched.email && validation.errors.email ? <div className='text-sm text-destructive'>{validation.errors.email}</div> : null}
                  </div>
                </div>
              </div>
              {Object.entries(manageUser.permissions!).map(([module, moduleInfo]) => (
                <div className='flex flex-wrap -mx-3 mb-4' key={module}>
                  <CategoryTeamMembersHeader title={module} icon={moduleInfo.icon!} checked={moduleInfo.view} manageUser={manageUser} setManageUser={setManageUser} />
                  <div className='flex flex-wrap -mx-3 px-6 py-2 gap-4'>
                    {Object.entries(moduleInfo.modules).map(([subModule, subModuleInfo]) => (
                      <div className='px-3 flex-1 basis-0' key={subModule}>
                        <div className='flex flex-row justify-start items-end w-fit gap-2'>
                          <Label className='form-check-label text-nowrap font-normal'>{subModule}</Label>
                          <div className='form-check-info'>
                            <input className='form-check-input size-4 shrink-0 border border-input-border accent-primary rounded-sm' type='checkbox' checked={subModuleInfo.view} onChange={() => handleChangePermissions(module, subModule)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {formError && <p className='text-danger mb-0 pb-0 text-[11.2px]'>{formError}</p>}
            </>
          ) : (
            <>
              <span className='font-normal text-[16.25px] me-4'>Loading Modules...</span>
              <Spinner className='text-primary' />
            </>
          )}
        </div>
        <DialogFooter className='items-center flex flex-row justify-end items-center gap-2'>
          <Button variant='light' onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button disabled={loading} type='submit' variant='success'>
            {loading ? <Spinner className='text-white' /> : 'Send Invite'}
          </Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateNewTeamMemberModal
