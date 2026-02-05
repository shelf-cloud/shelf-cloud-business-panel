import React, { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'

type EditComment = {
  show: boolean
  id: number
  comment: string
}

type Props = {
  editCommentModal: EditComment
  setEditCommentModal: (prev: EditComment) => void
  mutate: () => void
}

const EditCommerceHubCommentModal = ({ editCommentModal, setEditCommentModal, mutate }: Props) => {
  const { state }: any = useContext(AppContext)
  const [newComment, setnewComment] = useState(editCommentModal.comment)
  const [isLoading, setisLoading] = useState(false)

  const hanldeEditFBAShipmentName = async () => {
    setisLoading(true)
    const editComment = toast.loading('Saving Comment...')
    try {
      const response = await axios
        .post(`/api/commerceHub/editComment?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          id: editCommentModal.id,
          comment: newComment,
        })
        .then((res) => res.data)

      if (!response.error) {
        toast.update(editComment, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setEditCommentModal({
          show: false,
          id: 0,
          comment: '',
        })
        mutate()
      } else {
        toast.update(editComment, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.update(editComment, {
        render: 'Error saving comment',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
    setisLoading(false)
  }

  return (
    <Modal
      fade={false}
      size='md'
      centered
      id='editCommentModal'
      isOpen={editCommentModal.show}
      toggle={() => {
        setEditCommentModal({
          show: false,
          id: 0,
          comment: '',
        })
      }}>
      <ModalHeader
        toggle={() => {
          setEditCommentModal({
            show: false,
            id: 0,
            comment: '',
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Comment
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col md={12} className='mt-2'>
            <DebounceInput
              element='textarea'
              minLength={2}
              debounceTimeout={500}
              className='form-control fs-7'
              placeholder='Comment ...'
              id='search-options'
              value={editCommentModal.comment}
              onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
              onChange={(e) => setnewComment(e.target.value)}
            />
          </Col>
          <div className='mt-4 d-flex flex-row gap-3 justify-content-end'>
            <Button
              disabled={isLoading}
              type='button'
              color='light'
              className='btn'
              onClick={() => {
                setEditCommentModal({
                  show: false,
                  id: 0,
                  comment: '',
                })
              }}>
              Cancel
            </Button>
            <Button disabled={isLoading} type='button' color='success' className='btn' onClick={hanldeEditFBAShipmentName}>
              {isLoading ? <Spinner color='light' size={'sm'} /> : 'Save'}
            </Button>
          </div>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default EditCommerceHubCommentModal
