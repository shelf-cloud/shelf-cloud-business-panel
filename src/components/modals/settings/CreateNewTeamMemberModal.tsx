import AppContext from '@context/AppContext'
import React, { useContext, useState } from 'react'
import CategoryTeamMembersHeader from '@components/settings/team_members/CategoryTeamMembersHeader'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap'
import axios from 'axios'
import { toast } from 'react-toastify'
import { NewTeamMember } from '@typesTs/settings/team_members'
import useSWR, { useSWRConfig } from 'swr'
import { useFormik } from 'formik'
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
    <Modal fade={false} size='lg' id='unitsSoldDetailsModal' isOpen={showModal} toggle={() => setShowModal(false)}>
      <ModalHeader toggle={() => setShowModal(false)}>
        <p className='m-0 p-0 mb-1 fw-bold fs-3'>Create New Team Member</p>
      </ModalHeader>
      <Form onSubmit={handleCreateNewTeamMember}>
        <ModalBody className='pb-0'>
          {!loadingModules ? (
            <>
              <Row>
                <Col lg={6}>
                  <FormGroup className='mb-3'>
                    <Label htmlFor='firstNameinput' className='form-label'>
                      *User Name
                    </Label>
                    <Input
                      type='text'
                      className='form-control'
                      placeholder='Company Name...'
                      id='name'
                      name='name'
                      bsSize='sm'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.name || ''}
                      invalid={validation.touched.name && validation.errors.name ? true : false}
                    />
                    {validation.touched.name && validation.errors.name ? <FormFeedback type='invalid'>{validation.errors.name}</FormFeedback> : null}
                  </FormGroup>
                </Col>
                <Col lg={6}>
                  <FormGroup className='mb-3'>
                    <Label htmlFor='firstNameinput' className='form-label'>
                      *Email Address
                    </Label>
                    <Input
                      type='text'
                      className='form-control'
                      placeholder='Email Address...'
                      id='email'
                      name='email'
                      bsSize='sm'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.email || ''}
                      invalid={validation.touched.email && validation.errors.email ? true : false}
                    />
                    {validation.touched.email && validation.errors.email ? <FormFeedback type='invalid'>{validation.errors.email}</FormFeedback> : null}
                  </FormGroup>
                </Col>
              </Row>
              {Object.entries(manageUser.permissions!).map(([module, moduleInfo]) => (
                <Row className='mb-3' key={module}>
                  <CategoryTeamMembersHeader title={module} icon={moduleInfo.icon!} checked={moduleInfo.view} manageUser={manageUser} setManageUser={setManageUser} />
                  <Row className='px-4 py-2 gap-3'>
                    {Object.entries(moduleInfo.modules).map(([subModule, subModuleInfo]) => (
                      <Col key={subModule}>
                        <div className='d-flex flex-row justify-content-start align-items-end w-fit gap-2'>
                          <Label className='form-check-label text-nowrap fw-normal'>{subModule}</Label>
                          <div className='form-check-info'>
                            <Input className='form-check-input' type='checkbox' checked={subModuleInfo.view} onChange={() => handleChangePermissions(module, subModule)} />
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Row>
              ))}
              {formError && <p className='text-danger mb-0 pb-0 fs-7'>{formError}</p>}
            </>
          ) : (
            <>
              <p className='fw-normal fs-5'>
                Loading Modules... <Spinner color='primary' size='sm' />
              </p>
            </>
          )}
        </ModalBody>
        <ModalFooter className='d-flex flex-row justify-content-end align-items-center gap-2'>
          <Button color='light' onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button disabled={loading} type='submit' color='success'>
            {loading ? <Spinner color='white' size='sm' /> : 'Send Invite'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  )
}

export default CreateNewTeamMemberModal
