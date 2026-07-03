import Link from 'next/link'
import React from 'react'

type Props = {
  title: string
  pageTitle: string
}

const BreadCrumb = ({ title, pageTitle }: Props) => {
  return (
    <React.Fragment>
      <div className='flex flex-wrap -mx-3'>
        <div className='px-3 w-full mx-0'>
          <div className='w-full page-title-box sm:flex items-center justify-between'>
            <h4 className='sm:mb-0 font-semibold' style={{ textTransform: 'capitalize' }}>
              {title}
            </h4>
            <div className='page-title-right'>
              <ol className='breadcrumb m-0'>
                <li className='breadcrumb-item'>
                  <Link href={'#'}>{pageTitle}</Link>
                </li>
                <li className='breadcrumb-item active'>{title}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default BreadCrumb
